'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Subscription } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { addMonths, addYears, format } from 'date-fns';

function removeUndefined<T extends object>(obj: T): Partial<T> {
  return Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as Partial<T>;
}

function calcRenewalDate(billingCycle: 'monthly' | 'yearly', startDate: string): string {
  const today = new Date();
  let renewal = new Date(startDate);
  if (billingCycle === 'monthly') {
    while (renewal <= today) renewal = addMonths(renewal, 1);
  } else {
    while (renewal <= today) renewal = addYears(renewal, 1);
  }
  return format(renewal, 'yyyy-MM-dd');
}

export function useSubscriptions() {
  const { user } = useAuth();
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSubscriptions([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'subscriptions'), where('userId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const subs = snapshot.docs.map((d) => ({ id: d.id, ...d.data() })) as Subscription[];
      setSubscriptions(subs);
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  const addSubscription = async (data: Omit<Subscription, 'id' | 'userId' | 'renewalDate' | 'createdAt' | 'updatedAt'>) => {
    if (!user) return;
    const renewalDate = calcRenewalDate(data.billingCycle, data.startDate);
    await addDoc(collection(db, 'subscriptions'), removeUndefined({
      ...data,
      userId: user.uid,
      renewalDate,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));
  };

  const updateSubscription = async (id: string, data: Partial<Omit<Subscription, 'id' | 'userId'>>) => {
    const ref = doc(db, 'subscriptions', id);
    const current = subscriptions.find((s) => s.id === id);
    if (!current) return;
    const merged = { ...current, ...data };
    const renewalDate = calcRenewalDate(merged.billingCycle, merged.startDate);
    await updateDoc(ref, removeUndefined({ ...data, renewalDate, updatedAt: new Date().toISOString() }));
  };

  const deleteSubscription = async (id: string) => {
    await deleteDoc(doc(db, 'subscriptions', id));
  };

  return { subscriptions, loading, addSubscription, updateSubscription, deleteSubscription };
}
