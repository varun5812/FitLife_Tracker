import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Line, Circle, Defs, LinearGradient, Stop, Rect } from 'react-native-svg';
import { useTheme } from '../../context/ThemeContext';
import { Spacing, Typography, BorderRadius } from '../../constants/theme';
import { ProgressDataPoint } from '../../services/progressService';

interface StatChartProps {
  data: ProgressDataPoint[];
  color: string;
  type?: 'line' | 'bar';
  unit?: string;
  height?: number;
  emptyMessage?: string;
}

export const StatChart: React.FC<StatChartProps> = ({
  data,
  color,
  type = 'line',
  unit = '',
  height = 180,
  emptyMessage = 'No data points recorded for this period yet.',
}) => {
  const { colors } = useTheme();
  const screenWidth = Dimensions.get('window').width;
  const chartWidth = screenWidth - Spacing.lg * 2 - Spacing.md * 2;
  const chartHeight = height - 40;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.emptyContainer, { height }]}>
        <Text style={[Typography.subtext, { color: colors.textMuted, textAlign: 'center' }]}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  const values = data.map(d => d.value);
  const minVal = Math.min(...values, 0);
  const maxVal = Math.max(...values, 10);
  const range = maxVal - minVal || 1;

  const getX = (index: number) => {
    if (data.length <= 1) return chartWidth / 2;
    return (index / (data.length - 1)) * (chartWidth - 40) + 20;
  };

  const getY = (val: number) => {
    return chartHeight - ((val - minVal) / range) * (chartHeight - 30) - 15;
  };

  // Construct Line Path
  let pathD = '';
  if (data.length === 1) {
    pathD = `M 20 ${getY(data[0].value)} L ${chartWidth - 20} ${getY(data[0].value)}`;
  } else {
    pathD = data.reduce((acc, pt, idx) => {
      const x = getX(idx);
      const y = getY(pt.value);
      return idx === 0 ? `M ${x} ${y}` : `${acc} L ${x} ${y}`;
    }, '');
  }

  // Construct Area Gradient Path
  const firstX = getX(0);
  const lastX = getX(data.length - 1);
  const areaD = `${pathD} L ${lastX} ${chartHeight} L ${firstX} ${chartHeight} Z`;

  const gradientId = `chart_grad_${Math.random().toString(36).substring(7)}`;

  return (
    <View style={styles.container}>
      <Svg width={chartWidth} height={chartHeight}>
        <Defs>
          <LinearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <Stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <Stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </LinearGradient>
        </Defs>

        {/* Grid horizontal guide lines */}
        {[0, 0.5, 1].map((ratio, idx) => {
          const yPos = chartHeight * ratio;
          return (
            <Line
              key={idx}
              x1="0"
              y1={yPos}
              x2={chartWidth}
              y2={yPos}
              stroke={colors.border}
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          );
        })}

        {type === 'line' ? (
          <>
            {/* Area Fill */}
            <Path d={areaD} fill={`url(#${gradientId})`} />

            {/* Line */}
            <Path
              d={pathD}
              fill="none"
              stroke={color}
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Points */}
            {data.map((pt, idx) => {
              const cx = getX(idx);
              const cy = getY(pt.value);
              return (
                <Circle
                  key={idx}
                  cx={cx}
                  cy={cy}
                  r="4"
                  fill={colors.card}
                  stroke={color}
                  strokeWidth="2.5"
                />
              );
            })}
          </>
        ) : (
          // Bar Chart rendering
          data.map((pt, idx) => {
            const barWidth = Math.max(8, Math.min(24, (chartWidth - 60) / data.length));
            const x = (idx / (data.length > 1 ? data.length - 1 : 1)) * (chartWidth - 60) + 30 - barWidth / 2;
            const barHeight = ((pt.value - minVal) / range) * (chartHeight - 30);
            const y = chartHeight - barHeight - 15;
            return (
              <Rect
                key={idx}
                x={x}
                y={y}
                width={barWidth}
                height={Math.max(4, barHeight)}
                rx={4}
                fill={color}
              />
            );
          })
        )}
      </Svg>

      {/* X-Axis Labels */}
      <View style={styles.labelsRow}>
        {data.length <= 8 ? (
          data.map((pt, idx) => (
            <Text key={idx} style={[Typography.caption, { color: colors.textSecondary }]}>
              {pt.label}
            </Text>
          ))
        ) : (
          <>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>{data[0].label}</Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {data[Math.floor(data.length / 2)].label}
            </Text>
            <Text style={[Typography.caption, { color: colors.textSecondary }]}>
              {data[data.length - 1].label}
            </Text>
          </>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: Spacing.sm,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  labelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: Spacing.md,
    marginTop: Spacing.xs,
  },
});
