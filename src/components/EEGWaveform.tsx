import React, { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { ZoomIn, ZoomOut, RotateCcw, Eye, EyeOff } from 'lucide-react';
import type { WaveformChannel } from '../types/analysis';

interface EEGWaveformProps {
  waveform: WaveformChannel[];
}

const CHANNEL_COLORS = [
  '#087A46', '#14945A', '#005C35', '#1AA067',
  '#2DB87A', '#3DC484', '#4DD090', '#5DDC9C',
  '#6DE8A8',
];

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ color: string; name: string; value: number }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="bg-white border border-[#DDE4DC] rounded-xl px-3 py-2 shadow-lg text-xs"
      style={{ fontFamily: 'Inter, sans-serif' }}
    >
      <p className="text-[#5F6862] mb-1 font-medium">t = {label}s</p>
      {payload.map((entry) => (
        <div key={entry.name} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: entry.color }} />
          <span className="text-[#111614] font-semibold">{entry.name}:</span>
          <span className="text-[#5F6862]">{entry.value.toFixed(1)} µV</span>
        </div>
      ))}
    </div>
  );
};

const EEGWaveform: React.FC<EEGWaveformProps> = ({ waveform }) => {
  const [visibleChannels, setVisibleChannels] = useState<Set<string>>(
    new Set(waveform.map(ch => ch.channel))
  );
  const [zoomLevel, setZoomLevel] = useState(1);
  const [viewStart, setViewStart] = useState(0);

  const POINTS_PER_VIEW = Math.round(100 / zoomLevel);

  const chartData = useMemo(() => {
    const maxLen = Math.max(...waveform.map(ch => ch.values.length));
    const totalPoints = Math.min(maxLen, waveform[0]?.values.length ?? 0);
    const visibleEnd = Math.min(viewStart + POINTS_PER_VIEW, totalPoints);
    const step = 0.05; // 50ms per point = 20 samples/s

    return Array.from({ length: visibleEnd - viewStart }, (_, i) => {
      const idx = viewStart + i;
      const t = parseFloat((idx * step).toFixed(2));
      const point: Record<string, number> = { t };
      waveform.forEach(ch => {
        point[ch.channel] = ch.values[idx] ?? 0;
      });
      return point;
    });
  }, [waveform, viewStart, POINTS_PER_VIEW]);

  const totalPoints = waveform[0]?.values.length ?? 0;
  const canScrollLeft = viewStart > 0;
  const canScrollRight = viewStart + POINTS_PER_VIEW < totalPoints;

  const toggleChannel = (channel: string) => {
    setVisibleChannels(prev => {
      const next = new Set(prev);
      if (next.has(channel)) {
        if (next.size > 1) next.delete(channel);
      } else {
        next.add(channel);
      }
      return next;
    });
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 2, 8));
    setViewStart(0);
  };
  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 2, 1));
    setViewStart(0);
  };
  const handleReset = () => {
    setZoomLevel(1);
    setViewStart(0);
  };
  const handleScrollLeft = () => {
    setViewStart(prev => Math.max(0, prev - Math.round(POINTS_PER_VIEW / 4)));
  };
  const handleScrollRight = () => {
    setViewStart(prev => Math.min(totalPoints - POINTS_PER_VIEW, prev + Math.round(POINTS_PER_VIEW / 4)));
  };

  return (
    <section
      className="bg-white rounded-2xl border border-[#DDE4DC] overflow-hidden"
      style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
      aria-labelledby="waveform-heading"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-4 sm:px-6 py-4 border-b border-[#DDE4DC]">
        <div>
          <h2
            id="waveform-heading"
            className="text-lg font-bold text-[#111614]"
            style={{ fontFamily: 'Manrope, sans-serif' }}
          >
            Extracted EEG Waveform
          </h2>
          <p className="text-xs text-[#5F6862] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
            Approximate waveform reconstructed from the uploaded EEG report
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={handleScrollLeft}
            disabled={!canScrollLeft}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5F6862] bg-[#F8F6EC] hover:bg-[#DCEBDD] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll waveform left"
          >
            ←
          </button>
          <button
            onClick={handleScrollRight}
            disabled={!canScrollRight}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-[#5F6862] bg-[#F8F6EC] hover:bg-[#DCEBDD] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Scroll waveform right"
          >
            →
          </button>
          <button
            onClick={handleZoomOut}
            disabled={zoomLevel <= 1}
            className="p-1.5 rounded-lg text-[#5F6862] bg-[#F8F6EC] hover:bg-[#DCEBDD] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <span className="text-xs text-[#5F6862] font-medium w-10 text-center" style={{ fontFamily: 'Inter, sans-serif' }}>
            {zoomLevel}x
          </span>
          <button
            onClick={handleZoomIn}
            disabled={zoomLevel >= 8}
            className="p-1.5 rounded-lg text-[#5F6862] bg-[#F8F6EC] hover:bg-[#DCEBDD] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button
            onClick={handleReset}
            className="p-1.5 rounded-lg text-[#5F6862] bg-[#F8F6EC] hover:bg-[#DCEBDD] transition-all"
            aria-label="Reset view"
          >
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Channel toggles */}
      <div className="flex flex-wrap gap-2 px-4 sm:px-6 py-3 border-b border-[#DDE4DC] bg-[#FCFBF5]">
        {waveform.map((ch, i) => {
          const isVisible = visibleChannels.has(ch.channel);
          return (
            <button
              key={ch.channel}
              onClick={() => toggleChannel(ch.channel)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200 ${
                isVisible
                  ? 'text-white'
                  : 'bg-[#F0F0EE] text-[#5F6862] hover:bg-[#DCEBDD]'
              }`}
              style={{
                backgroundColor: isVisible ? CHANNEL_COLORS[i % CHANNEL_COLORS.length] : undefined,
                fontFamily: 'Inter, sans-serif',
              }}
              aria-pressed={isVisible}
              aria-label={`Toggle ${ch.label} channel`}
            >
              {isVisible ? <Eye size={10} /> : <EyeOff size={10} />}
              {ch.label}
            </button>
          );
        })}
      </div>

      {/* Chart */}
      <div className="px-2 sm:px-4 pt-4 pb-2 min-w-0 overflow-hidden" style={{ height: '300px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#DDE4DC"
              strokeOpacity={0.6}
            />
            <XAxis
              dataKey="t"
              tick={{ fontSize: 10, fill: '#5F6862', fontFamily: 'Inter, sans-serif' }}
              tickFormatter={(v) => `${v}s`}
              axisLine={{ stroke: '#DDE4DC' }}
              tickLine={false}
              label={{ value: 'Time (s)', position: 'insideBottom', offset: -4, fontSize: 10, fill: '#5F6862', fontFamily: 'Inter, sans-serif' }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#5F6862', fontFamily: 'Inter, sans-serif' }}
              tickFormatter={(v) => `${v}`}
              axisLine={{ stroke: '#DDE4DC' }}
              tickLine={false}
              width={38}
              label={{ value: 'µV', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#5F6862', fontFamily: 'Inter, sans-serif' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              formatter={(value) => {
                const ch = waveform.find(c => c.channel === value);
                return (
                  <span style={{ fontSize: 11, color: '#5F6862', fontFamily: 'Inter, sans-serif' }}>
                    {ch?.label ?? value}
                  </span>
                );
              }}
              wrapperStyle={{ paddingTop: '8px', fontSize: '11px' }}
            />
            {waveform.map((ch, i) =>
              visibleChannels.has(ch.channel) ? (
                <Line
                  key={ch.channel}
                  type="monotone"
                  dataKey={ch.channel}
                  name={ch.channel}
                  stroke={CHANNEL_COLORS[i % CHANNEL_COLORS.length]}
                  strokeWidth={1.4}
                  dot={false}
                  activeDot={{ r: 3, strokeWidth: 1 }}
                  animationDuration={600}
                />
              ) : null
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Time indicator */}
      <div className="px-6 pb-4 flex items-center gap-2 text-[10px] text-[#5F6862]" style={{ fontFamily: 'Inter, sans-serif' }}>
        <span>Showing {(viewStart * 0.05).toFixed(1)}s – {Math.min((viewStart + POINTS_PER_VIEW) * 0.05, totalPoints * 0.05).toFixed(1)}s</span>
        <span>·</span>
        <span>Total: {(totalPoints * 0.05).toFixed(1)}s</span>
        <span>·</span>
        <span className="text-amber-600 font-medium">Extracted from uploaded EEG report</span>
      </div>
    </section>
  );
};

export default EEGWaveform;
