'use client';

import { useState, useEffect } from 'react';
import { Block, BlockCategory, BlockFormData, DAY_NAMES, COLOR_PALETTE, DURATION_OPTIONS, CATEGORY_COLORS } from '@/lib/types';
import { X } from 'lucide-react';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BlockFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  initialData?: {
    day_of_week: number;
    start_hour: number;
    start_minute: number;
  } | null;
  block?: Block | null;
}

export function BlockModal({ isOpen, onClose, onSave, onDelete, initialData, block }: BlockModalProps) {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlockCategory>('studio');
  const [color, setColor] = useState(CATEGORY_COLORS.studio);
  const [day_of_week, setDayOfWeek] = useState(0);
  const [start_hour, setStartHour] = useState(9);
  const [start_minute, setStartMinute] = useState(0);
  const [duration_minutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setCategory(block.category);
      setColor(block.color);
      setDayOfWeek(block.day_of_week);
      setStartHour(block.start_hour);
      setStartMinute(block.start_minute);
      setDurationMinutes(block.duration_minutes);
      setNotes(block.notes || '');
    } else if (initialData) {
      setTitle('');
      setCategory('studio');
      setColor(CATEGORY_COLORS.studio);
      setDayOfWeek(initialData.day_of_week);
      setStartHour(initialData.start_hour);
      setStartMinute(initialData.start_minute);
      setDurationMinutes(60);
      setNotes('');
    }
  }, [block, initialData]);

  const handleCategoryChange = (cat: BlockCategory) => {
    setCategory(cat);
    setColor(CATEGORY_COLORS[cat]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    await onSave({
      title: title.trim(),
      category,
      color,
      day_of_week,
      start_hour,
      start_minute,
      duration_minutes,
      notes,
    });
    setLoading(false);
  };

  if (!isOpen) return null;

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push({ hour: h, minute: m });
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-[#1a1a1a] rounded-lg w-full max-w-md mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-[#f5f5f5]">
            {block ? 'Modifica blocco' : 'Nuovo blocco'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-[#2a2a2a] rounded">
            <X className="w-5 h-5 text-[#888888]" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Titolo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-[#222222] text-[#f5f5f5] rounded-md placeholder-[#888888] border border-[#2a2a2a] focus:border-[#e8e0d0] focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-2">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {(['studio', 'lavoro', 'lezione', 'altro'] as BlockCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-2 rounded-md text-sm transition-colors ${
                    category === cat
                      ? 'bg-[#e8e0d0] text-[#0f0f0f]'
                      : 'bg-[#222222] text-[#f5f5f5] hover:bg-[#2a2a2a]'
                  }`}
                >
                  {cat === 'studio' && '📚'}
                  {cat === 'lavoro' && '💼'}
                  {cat === 'lezione' && '🎓'}
                  {cat === 'altro' && '📌'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-2">Colore</label>
            <div className="flex gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-[#1a1a1a]' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-[#888888] mb-2">Giorno</label>
              <select
                value={day_of_week}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#222222] text-[#f5f5f5] rounded-md border border-[#2a2a2a] focus:border-[#e8e0d0] focus:outline-none"
              >
                {DAY_NAMES.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-[#888888] mb-2">Durata</label>
              <select
                value={duration_minutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 bg-[#222222] text-[#f5f5f5] rounded-md border border-[#2a2a2a] focus:border-[#e8e0d0] focus:outline-none"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-2">Ora di inizio</label>
            <select
              value={`${start_hour}:${start_minute.toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                setStartHour(h);
                setStartMinute(m);
              }}
              className="w-full px-4 py-3 bg-[#222222] text-[#f5f5f5] rounded-md border border-[#2a2a2a] focus:border-[#e8e0d0] focus:outline-none"
            >
              {timeOptions.map((opt) => (
                <option key={`${opt.hour}:${opt.minute}`} value={`${opt.hour}:${opt.minute}`}>
                  {opt.hour.toString().padStart(2, '0')}:{opt.minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-[#888888] mb-2">Note (opzionale)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note..."
              rows={3}
              className="w-full px-4 py-3 bg-[#222222] text-[#f5f5f5] rounded-md placeholder-[#888888] border border-[#2a2a2a] focus:border-[#e8e0d0] focus:outline-none resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {block && (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
              >
                Elimina
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-[#222222] text-[#f5f5f5] rounded-md transition-colors hover:bg-[#2a2a2a]"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-3 bg-[#e8e0d0] text-[#0f0f0f] rounded-md font-medium transition-colors hover:bg-[#d4cbc0] disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}