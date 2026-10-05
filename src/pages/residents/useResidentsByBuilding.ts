/**
 *  useResidentsByBuilding.ts
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { useState, useEffect, useContext, useCallback } from 'react';
import { UserContext } from '../../components/contexts/UserContext';
import { Unit } from '../../types/interfaces';
import { getResidentsByBuilding, updateResident } from '../../services/residentService';

export type UnitWithResidents = {
  unit: Unit;
  residents: Array<{ id: number; name: string }>;
};

export function useResidentsByBuilding(buildingId: number | null) {
  const { user } = useContext(UserContext);
  const [data, setData] = useState<UnitWithResidents[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (buildingId === null) {
      setData([]);
      return;
    }

    let cancelled = false;

    async function fetchData() {
      setIsLoading(true);
      setData([]);
      setError(null);
      try {
        const rows = await getResidentsByBuilding(user, buildingId!);

        const unitMap = new Map<number, UnitWithResidents>();
        for (const row of rows) {
          if (!unitMap.has(row.unit_id)) {
            unitMap.set(row.unit_id, {
              unit: { id: row.unit_id, unit_number: row.unit_number },
              residents: [],
            });
          }
          unitMap
            .get(row.unit_id)!
            .residents.push({ id: row.id, name: row.name });
        }

        const result = Array.from(unitMap.values()).sort((a, b) =>
          a.unit.unit_number.localeCompare(b.unit.unit_number, undefined, {
            numeric: true,
          }),
        );

        if (!cancelled) {
          setData(result);
        }
      } catch {
        if (!cancelled) {
          setError('Failed to load residents');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, [buildingId, user]);

  const updateResidentName = useCallback(
    async (id: number, name: string, unitId: number) => {
      await updateResident(user, id, name, unitId);

      setData((prev) => {
        return prev.map((unitGroup) => {
          if (unitGroup.unit.id === unitId) {
            const existingResident = unitGroup.residents.find(
              (resident) => resident.id === id,
            );

            if (existingResident) {
              return {
                ...unitGroup,
                residents: unitGroup.residents.map((resident) =>
                  resident.id === id ? { ...resident, name } : resident,
                ),
              };
            }

            return {
              ...unitGroup,
              residents: [...unitGroup.residents, { id, name }],
            };
          }

          return {
            ...unitGroup,
            residents: unitGroup.residents.filter((resident) => resident.id !== id),
          };
        });
      });
    },
    [user],
  );

  return { data, isLoading, error, updateResidentName };
}
