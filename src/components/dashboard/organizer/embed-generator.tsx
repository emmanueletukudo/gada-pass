'use client';

import { useState, useEffect } from 'react';
import { Copy, Check, ExternalLink, Eye } from 'lucide-react';
import { toast } from 'sonner';

interface EmbedGeneratorProps {
  eventId: string;
  eventTitle?: string;
}

const WIDTH_PRESETS = ['100%', '450px', '380px'] as const;

export default function EmbedGenerator({
  eventId,
  eventTitle,
}: EmbedGeneratorProps) {
  const [width, setWidth] = useState<string>('100%');
  const [height, setHeight] = useState<number>(580);
  const [borderRadius, setBorderRadius] = useState<number>(24);
  const [showBorder, setShowBorder] = useState<boolean>(true);

  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [origin, setOrigin] = useState<string>('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setOrigin(window.location.origin);
    }
  }, []);

  const embedUrl = `${origin}/embed/events/${eventId}`;

  const borderStyle = showBorder
    ? 'border: 1px solid #dce1d5;'
    : 'border: none;';
  const iframeSnippet = `<iframe\n  src="${embedUrl}"\n  width="${width}"\n  height="${height}px"\n  style="${borderStyle} border-radius: ${borderRadius}px; overflow: hidden;"\n  title="${eventTitle || 'Gada Pass Ticket Widget'}"\n  loading="lazy"\n></iframe>`;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(iframeSnippet);
      setCopiedCode(true);
      toast.success('Iframe embed code copied to clipboard!');
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      toast.error('Failed to copy code to clipboard.');
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(embedUrl);
      setCopiedUrl(true);
      toast.success('Embed URL copied to clipboard!');
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch {
      toast.error('Failed to copy URL to clipboard.');
    }
  };

  return (
    <div className="space-y-6 rounded-3xl border border-[#dce1d5] bg-[#fffef9] p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#dce1d5] pb-4">
        <div>
          <h2 className="text-base font-bold text-[#17211b] flex items-center gap-2">
            Website Embed Widget
          </h2>
          <p className="text-xs text-[#6d766d] mt-1">
            Customize and embed a seamless ticket purchasing widget directly
            into your website (WordPress, Webflow, Squarespace, Wix, etc.).
          </p>
        </div>
        <a
          href={embedUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 rounded-full border border-[#dce1d5] bg-white px-4 py-2 text-xs font-bold text-[#17211b] transition hover:bg-[#f7f7f2]"
        >
          <span>Open Full Embed Page</span>
          <ExternalLink className="h-3.5 w-3.5 text-[#6d766d]" />
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-5">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6d766d]">
            <span>Widget Configuration</span>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211b]">Width</label>
            <div className="grid grid-cols-3 gap-2">
              {WIDTH_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setWidth(preset)}
                  className={`rounded-xl border py-2 text-xs font-bold transition ${
                    width === preset
                      ? 'border-[#17211b] bg-[#17211b] text-white'
                      : 'border-[#dce1d5] bg-white text-[#6d766d] hover:bg-[#f7f7f2]'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211b]">
              Height ({height}px)
            </label>
            <input
              type="range"
              min="400"
              max="800"
              step="10"
              value={height}
              onChange={(e) => setHeight(Number(e.target.value))}
              className="w-full accent-[#17211b] cursor-pointer"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-[#17211b]">
              Corner Rounding ({borderRadius}px)
            </label>
            <input
              type="range"
              min="0"
              max="32"
              step="2"
              value={borderRadius}
              onChange={(e) => setBorderRadius(Number(e.target.value))}
              className="w-full accent-[#17211b] cursor-pointer"
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer rounded-xl border border-[#dce1d5] p-3 bg-white">
            <input
              type="checkbox"
              checked={showBorder}
              onChange={(e) => setShowBorder(e.target.checked)}
              className="h-4 w-4 bg-black rounded border-[#dce1d5] text-[#17211b] focus:ring-0 cursor-pointer"
            />
            <span className="text-xs font-bold text-[#17211b]">
              Show subtle outer border
            </span>
          </label>

          <div className="space-y-2 pt-2">
            <button
              onClick={handleCopyCode}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#17211b] py-3.5 text-xs font-bold text-white transition hover:bg-[#25332b]"
            >
              {copiedCode ? (
                <Check className="h-4 w-4 text-[#d6f94a]" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              <span>
                {copiedCode ? 'HTML Snippet Copied!' : 'Copy Embed Code'}
              </span>
            </button>

            <button
              onClick={handleCopyUrl}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full border border-[#dce1d5] bg-white py-3 text-xs font-bold text-[#17211b] transition hover:bg-[#f7f7f2]"
            >
              {copiedUrl ? (
                <Check className="h-3.5 w-3.5 text-[#ff5500]" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
              <span>
                {copiedUrl ? 'URL Copied!' : 'Copy Direct Embed Link'}
              </span>
            </button>
          </div>
        </div>

        <div className="lg:col-span-7 space-y-3">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6d766d]">
              <Eye className="h-4 w-4" /> Live Preview
            </span>
            <span className="text-[10px] text-[#6d766d]">
              Interactive Preview
            </span>
          </div>

          <div className="rounded-2xl border border-dashed border-[#dce1d5] bg-[#f7f7f2] p-4 flex items-center justify-center overflow-x-auto min-h-112.5">
            <div
              style={{
                width,
                height: `${height}px`,
                borderRadius: `${borderRadius}px`,
                overflow: 'hidden',
                border: showBorder ? '1px solid #dce1d5' : 'none',
              }}
              className="transition-all duration-200 bg-white shadow-sm"
            >
              <iframe
                src={embedUrl}
                width="100%"
                height="100%"
                className="w-full h-full border-none"
                title="Embed Preview"
              />
            </div>
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6d766d]">
              Generated Snippet
            </span>
            <pre className="rounded-xl bg-[#17211b] p-3 text-[11px] font-mono text-[#d6f94a] overflow-x-auto">
              <code>{iframeSnippet}</code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
