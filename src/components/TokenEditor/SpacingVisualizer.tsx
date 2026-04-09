import { motion } from 'framer-motion';
import { Ruler } from 'lucide-react';
import { useTokenStore } from '../../store/useTokenStore';

export default function SpacingVisualizer() {
  const tokens = useTokenStore((s) => s.tokens);
  const updateSpacing = useTokenStore((s) => s.updateSpacing);
  const lockedPaths = useTokenStore((s) => s.lockedPaths);

  if (!tokens) return null;

  const { unit, scale } = tokens.spacing;
  const isUnitLocked = lockedPaths.includes('spacing.unit');

  const barColors = [
    '#6366f1',
    '#8b5cf6',
    '#a855f7',
    '#c084fc',
    '#d8b4fe',
    '#e9d5ff',
    '#f3e8ff',
    '#faf5ff',
    '#fefce8',
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Ruler className="w-4 h-4 text-gray-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Spacing
        </h3>
      </div>

      {/* Base unit input */}
      <div>
        <label className="text-[10px] text-gray-600 uppercase tracking-wider">
          Base Unit (px)
        </label>
        <input
          type="number"
          min={1}
          max={32}
          value={unit}
          onChange={(e) => {
            const val = parseInt(e.target.value) || 4;
            updateSpacing('unit', Math.max(1, Math.min(32, val)));
          }}
          disabled={isUnitLocked}
          className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Scale visualization */}
      <div className="space-y-2 mt-4">
        {scale.map((multiplier, i) => {
          const px = multiplier * unit;
          const barWidth = Math.min(multiplier * 20 + 8, 280);
          return (
            <div
              key={i}
              className="flex items-center gap-3 group"
            >
              <span className="text-[10px] font-mono text-gray-600 w-6 text-right flex-shrink-0">
                {i}
              </span>
              <motion.div
                className="h-6 rounded-md relative cursor-default flex items-center"
                style={{
                  width: `${barWidth}px`,
                  backgroundColor: barColors[i % barColors.length] + '33',
                  borderLeft: `3px solid ${barColors[i % barColors.length]}`,
                }}
                initial={{ width: 0 }}
                animate={{ width: barWidth }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
              >
                <span
                  className="text-[9px] font-mono px-2 whitespace-nowrap"
                  style={{ color: barColors[i % barColors.length] }}
                >
                  {multiplier}×
                </span>
              </motion.div>
              <span className="text-[10px] text-gray-600 font-mono flex-shrink-0">
                {px}px
              </span>
            </div>
          );
        })}
      </div>

      {/* Scale editor */}
      <div className="mt-4 p-3 bg-white/[0.02] border border-white/5 rounded-xl">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">
          Custom Scale
        </p>
        <div className="flex flex-wrap gap-1.5">
          {scale.map((val, i) => (
            <input
              key={i}
              type="number"
              min={0}
              max={64}
              value={val}
              onChange={(e) => {
                const newScale = [...scale];
                newScale[i] = parseInt(e.target.value) || 0;
                updateSpacing('scale', newScale);
              }}
              className="w-12 bg-white/5 border border-white/10 rounded-md px-1.5 py-1 text-[10px] font-mono text-white text-center focus:outline-none focus:border-brand-primary"
            />
          ))}
        </div>
      </div>
    </div>
  );
}
