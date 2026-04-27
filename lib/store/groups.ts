"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface FanGroup {
  id: string;
  name: string;
  cityKey: string;
  venueId: string;
  venueName: string;
  matchId: string;
  date: string;
  creatorId: string;
  memberCount: number;
  shareCode: string;
  createdAt: string;
}

interface GroupState {
  groups: FanGroup[];
  createGroup: (data: Omit<FanGroup, "id" | "shareCode" | "createdAt" | "memberCount">) => FanGroup;
  joinGroup: (shareCode: string) => boolean;
  deleteGroup: (id: string) => void;
  reset: () => void;
}

export const useGroups = create<GroupState>()(
  persist(
    (set, get) => ({
      groups: [],
      createGroup: (data) => {
        const group: FanGroup = {
          ...data,
          id: Math.random().toString(36).slice(2, 10),
          shareCode: Math.random().toString(36).slice(2, 8).toUpperCase(),
          memberCount: 1,
          createdAt: new Date().toISOString()
        };
        set({ groups: [...get().groups, group] });
        return group;
      },
      joinGroup: (shareCode) => {
        const idx = get().groups.findIndex((g) => g.shareCode === shareCode.toUpperCase());
        if (idx === -1) return false;
        const groups = [...get().groups];
        groups[idx] = { ...groups[idx], memberCount: groups[idx].memberCount + 1 };
        set({ groups });
        return true;
      },
      deleteGroup: (id) => set({ groups: get().groups.filter((g) => g.id !== id) })
      ,
      reset: () => set({ groups: [] })
    }),
    { name: "gameday-groups" }
  )
);
