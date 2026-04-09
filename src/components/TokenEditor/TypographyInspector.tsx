import { useTokenStore } from '../../store/useTokenStore';
import { Type } from 'lucide-react';

export default function TypographyInspector() {
  const tokens = useTokenStore((s) => s.tokens);
  const updateTypography = useTokenStore((s) => s.updateTypography);
  const lockedPaths = useTokenStore((s) => s.lockedPaths);

  if (!tokens) return null;

  const { headingFont, bodyFont, baseSize, lineHeight, weights } = tokens.typography;

  const isLocked = (key: string) => lockedPaths.includes(`typography.${key}`);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 mb-3">
        <Type className="w-4 h-4 text-gray-500" />
        <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          Typography
        </h3>
      </div>

      {/* Heading Font */}
      <div>
        <label className="text-[10px] text-gray-600 uppercase tracking-wider">
          Heading Font
        </label>
        <input
          type="text"
          value={headingFont}
          onChange={(e) => updateTypography('headingFont', e.target.value)}
          disabled={isLocked('headingFont')}
          className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Body Font */}
      <div>
        <label className="text-[10px] text-gray-600 uppercase tracking-wider">
          Body Font
        </label>
        <input
          type="text"
          value={bodyFont}
          onChange={(e) => updateTypography('bodyFont', e.target.value)}
          disabled={isLocked('bodyFont')}
          className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
        />
      </div>

      {/* Base Size & Line Height */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-[10px] text-gray-600 uppercase tracking-wider">
            Base Size
          </label>
          <input
            type="text"
            value={baseSize}
            onChange={(e) => updateTypography('baseSize', e.target.value)}
            disabled={isLocked('baseSize')}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-600 uppercase tracking-wider">
            Line Height
          </label>
          <input
            type="number"
            step="0.1"
            value={lineHeight}
            onChange={(e) =>
              updateTypography('lineHeight', parseFloat(e.target.value) || 1.5)
            }
            disabled={isLocked('lineHeight')}
            className="w-full mt-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-primary disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      {/* Font Weights */}
      <div>
        <label className="text-[10px] text-gray-600 uppercase tracking-wider">
          Font Weights
        </label>
        <div className="flex flex-wrap gap-1.5 mt-2">
          {[100, 200, 300, 400, 500, 600, 700, 800, 900].map((w) => (
            <button
              key={w}
              onClick={() => {
                if (isLocked('weights')) return;
                const newWeights = weights.includes(w)
                  ? weights.filter((wt) => wt !== w)
                  : [...weights, w].sort((a, b) => a - b);
                updateTypography('weights', newWeights);
              }}
              disabled={isLocked('weights')}
              className={`px-2 py-1 text-[10px] rounded-md font-medium transition-all ${
                weights.includes(w)
                  ? 'bg-brand-primary/20 text-brand-primary border border-brand-primary/30'
                  : 'bg-white/5 text-gray-500 border border-transparent hover:bg-white/10'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {w}
            </button>
          ))}
        </div>
      </div>

      {/* Live Specimen */}
      <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 mt-4">
        <p className="text-[10px] text-gray-600 uppercase tracking-wider mb-2">
          Live Preview
        </p>
        <h4
          style={{
            fontFamily: `'${headingFont}', sans-serif`,
            fontSize: '1.5rem',
            fontWeight: weights[weights.length - 1] || 700,
            lineHeight: lineHeight,
            color: 'white',
          }}
        >
          Heading Preview
        </h4>
        <p
          style={{
            fontFamily: `'${bodyFont}', sans-serif`,
            fontSize: baseSize,
            fontWeight: weights[0] || 400,
            lineHeight: lineHeight,
            color: '#9ca3af',
            marginTop: '8px',
          }}
        >
          The quick brown fox jumps over the lazy dog. This specimen shows how
          body text will render with your current typography settings.
        </p>
      </div>
    </div>
  );
}
