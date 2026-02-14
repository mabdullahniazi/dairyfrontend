import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAnimals, useAnimal } from '../hooks/useAnimals';
import { useToast } from '../components/Toast';

const animalTypes = ['cow', 'buffalo', 'goat', 'sheep'] as const;
const typeEmojis: Record<string, string> = {
  cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

const AnimalForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const animalId = Number(id);
  const navigate = useNavigate();
  const { addAnimal, editAnimal } = useAnimals();
  const { animal } = useAnimal(isEdit ? animalId : undefined);
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [tagNumber, setTagNumber] = useState('');
  const [type, setType] = useState<string>('cow');
  const [age, setAge] = useState('');
  const [attrKey, setAttrKey] = useState('');
  const [attrValue, setAttrValue] = useState('');
  const [attributes, setAttributes] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (animal && isEdit) {
      setName(animal.name || '');
      setTagNumber(animal.tagNumber || '');
      setType(animal.type || 'cow');
      setAge(animal.age ? String(animal.age) : '');
      setAttributes((animal.attributes as Record<string, string>) || {});
    }
  }, [animal, isEdit]);

  const handleAddAttribute = () => {
    if (attrKey.trim() && attrValue.trim()) {
      setAttributes(prev => ({ ...prev, [attrKey.trim()]: attrValue.trim() }));
      setAttrKey('');
      setAttrValue('');
    }
  };

  const handleRemoveAttribute = (key: string) => {
    setAttributes(prev => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    try {
      const data = {
        name: name.trim(),
        tagNumber: tagNumber.trim(),
        type: type as 'cow' | 'buffalo' | 'goat' | 'sheep',
        age: Number(age) || 0,
        attributes,
      };

      if (isEdit) {
        await editAnimal(animalId, data);
        showToast('Animal updated!', 'success');
      } else {
        await addAnimal(data);
        showToast('Animal added!', 'success');
      }
      navigate('/animals', { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-5 animate-[fadeIn_0.3s_ease-out] overflow-hidden">
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 sm:p-6 lg:mx-auto h-[calc(100vh-180px)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div className="w-full items-center flex justify-center gap-2">
            <div className="w-full">
              <label className="block text-sm font-bold text-stone-700 mb-1.5">Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Daisy"
                required
                className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Tag Number */}
            <div className="w-full">
              <label className="block text-sm font-bold text-stone-700 mb-1.5">Tag Number</label>
              <input
                type="text"
                value={tagNumber}
                onChange={e => setTagNumber(e.target.value)}
                placeholder="e.g. A-001"
                className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          {/* Animal Type */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">Animal Type *</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {animalTypes.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`
                    flex flex-col items-center gap-1 py-3 rounded-xl border-2 transition-all duration-200
                    ${type === t
                      ? 'border-sky-500 bg-sky-50 shadow-lg shadow-sky-500/10'
                      : 'border-stone-200 bg-white/60 hover:border-stone-300'
                    }
                  `}
                >
                  <span className="text-2xl">{typeEmojis[t]}</span>
                  <span className={`text-xs font-semibold capitalize ${type === t ? 'text-sky-700' : 'text-stone-500'}`}>
                    {t}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Age */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">Age (years)</label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="0"
              min="0"
              max="30"
              className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
            />
          </div>

          {/* Dynamic Attributes */}
          <div>
            <label className="block text-sm font-bold text-stone-700 mb-1.5">Custom Attributes</label>
            {Object.entries(attributes).length > 0 && (
              <div className="space-y-2 mb-3">
                {Object.entries(attributes).map(([key, value]) => (
                  <div key={key} className="flex items-center gap-2 bg-stone-50 rounded-xl px-3 py-2">
                    <span className="text-xs font-medium text-stone-600 capitalize flex-1">{key}: {value}</span>
                    <button type="button" onClick={() => handleRemoveAttribute(key)} className="text-stone-400 hover:text-red-500 transition-colors text-sm">✕</button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2">
              <input type="text" value={attrKey} onChange={e => setAttrKey(e.target.value)} placeholder="Attribute name" className="flex-1 bg-white/60 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all" />
              <div className="flex gap-2">
                <input type="text" value={attrValue} onChange={e => setAttrValue(e.target.value)} placeholder="Value" className="flex-1 bg-white/60 border border-stone-200 rounded-xl px-3 py-2.5 text-sm text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all" />
                <button type="button" onClick={handleAddAttribute} className="px-4 py-2.5 bg-white/60 hover:bg-white/60 rounded-xl text-stone-600 font-bold transition-colors flex-shrink-0">+</button>
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end w-full">
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="flex w-80 justify-center items-center bg-gradient-to-r from-sky-600/80 to-sky-700/80 hover:from-sky-600/90 hover:to-sky-700/90 hover:cursor-pointer disabled:bg-sky-300 disabled:cursor-not-allowed text-white rounded-xl py-3.5 font-bold text-base shadow-xl shadow-sky-500/20 transition-all duration-200 active:scale-[0.98]"
            >
              {submitting ? 'Saving...' : isEdit ? 'Update Animal' : 'Add Animal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AnimalForm;