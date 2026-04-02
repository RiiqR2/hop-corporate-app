import { View } from 'react-native';
import * as shape from 'd3-shape';
import React from 'react';
import { LineChart, XAxis, YAxis } from 'react-native-svg-charts';
import { useChartData } from '@/src/hooks';

export const LineChartComponent = ({
  data,
  strokeColor = 'blue',
  amount,
}: {
  data: number[];
  labels: string[];
  strokeColor?: string;
  height?: number;
  amount?: number | 0;
}) => {
  const { data: dataChart, yTicks, weekLabels, formatYAxisLabel } = useChartData(amount || 50000);

  return (
    <View style={{ width: '100%', height: 250, marginTop: 48 }}>
      <View style={{ flexDirection: 'row', height: 200, width: '100%' }}>
        <YAxis data={yTicks} contentInset={{ top: 10, bottom: 10 }} svg={{ fontSize: 12, fill: 'black' }} numberOfTicks={4} formatLabel={formatYAxisLabel} />
        <LineChart
          style={{ flex: 1, marginLeft: 8 }}
          data={[0, ...data]}
          svg={{ stroke: strokeColor, strokeWidth: 2 }}
          contentInset={{ top: 30, bottom: 30 }}
          curve={shape.curveNatural}
        />
      </View>

      <XAxis
        style={{ marginTop: 10, marginLeft: 30 }}
        data={dataChart}
        formatLabel={(_, index) => weekLabels[index] || ''}
        contentInset={{ left: 20, right: 20 }}
        svg={{ fontSize: 12, fill: 'black', textAnchor: 'middle' }}
      />
    </View>
  );
};
