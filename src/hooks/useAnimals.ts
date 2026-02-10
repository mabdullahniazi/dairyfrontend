import { useCallback } from 'react';
import { db, type IAnimal } from '../lib/db';
import { saveAnimal, updateAnimal, deleteAnimalLocally } from '../lib/sync';
import { useLiveQuery } from 'dexie-react-hooks';

export function useAnimals(typeFilter?: string) {
  const animals = useLiveQuery(
    () => {
      if (typeFilter && typeFilter !== 'all') {
        return db.animals.where('type').equals(typeFilter).reverse().sortBy('createdAt');
      }
      return db.animals.reverse().sortBy('createdAt');
    },
    [typeFilter]
  );

  const addAnimal = useCallback(async (data: Omit<IAnimal, 'id' | 'synced' | 'createdAt'>) => {
    return saveAnimal(data);
  }, []);

  const editAnimal = useCallback(async (id: number, data: Partial<IAnimal>) => {
    return updateAnimal(id, data);
  }, []);

  const removeAnimal = useCallback(async (id: number) => {
    return deleteAnimalLocally(id);
  }, []);

  return {
    animals: animals || [],
    addAnimal,
    editAnimal,
    removeAnimal,
    loading: animals === undefined,
  };
}

export function useAnimal(id: number | undefined) {
  const animal = useLiveQuery(
    () => (id ? db.animals.get(id) : undefined),
    [id]
  );
  return { animal, loading: animal === undefined && id !== undefined };
}
