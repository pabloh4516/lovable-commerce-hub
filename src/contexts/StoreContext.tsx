import React, { createContext, useContext, useState, useEffect } from 'react';
import { Store, useUserStores, useStoreMutations } from '@/hooks/useStores';
import { useAuth } from '@/hooks/useAuth';

interface StoreContextValue {
  currentStore: Store | null;
  setCurrentStore: (store: Store | null) => void;
  userStores: Store[];
  isLoading: boolean;
  switchStore: (storeId: string) => void;
}

const StoreContext = createContext<StoreContextValue | undefined>(undefined);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { data: userStoresData, isLoading } = useUserStores();
  const { assignUserToStore } = useStoreMutations();
  const [currentStore, setCurrentStore] = useState<Store | null>(null);

  const userStores = userStoresData?.map((su) => su.store).filter(Boolean) as Store[] || [];

  // Set initial store from user's primary store
  useEffect(() => {
    if (userStoresData?.length && !currentStore) {
      const primaryStore = userStoresData.find((su) => su.is_primary);
      if (primaryStore?.store) {
        setCurrentStore(primaryStore.store);
      } else if (userStoresData[0]?.store) {
        setCurrentStore(userStoresData[0].store);
      }
    }
  }, [userStoresData, currentStore]);

  // Load from localStorage if available
  useEffect(() => {
    const savedStoreId = localStorage.getItem('currentStoreId');
    if (savedStoreId && userStores.length) {
      const store = userStores.find((s) => s.id === savedStoreId);
      if (store) {
        setCurrentStore(store);
      }
    }
  }, [userStores]);

  const handleSetCurrentStore = (store: Store | null) => {
    setCurrentStore(store);
    if (store) {
      localStorage.setItem('currentStoreId', store.id);
    } else {
      localStorage.removeItem('currentStoreId');
    }
  };

  const switchStore = async (storeId: string) => {
    const store = userStores.find((s) => s.id === storeId);
    if (store && user?.id) {
      handleSetCurrentStore(store);
      // Update primary store in database
      try {
        await assignUserToStore.mutateAsync({
          storeId,
          userId: user.id,
          isPrimary: true,
        });
      } catch (error) {
        console.error('Failed to update primary store:', error);
      }
    }
  };

  return (
    <StoreContext.Provider
      value={{
        currentStore,
        setCurrentStore: handleSetCurrentStore,
        userStores,
        isLoading,
        switchStore,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
}

export function useStoreContext() {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStoreContext must be used within a StoreProvider');
  }
  return context;
}
