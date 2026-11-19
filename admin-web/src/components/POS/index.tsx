'use client';

import { useAuth } from '@/context/AuthContext';
import { usePOS } from '@/hooks/usePOS';
import PosProductGrid from './PosProductGrid';
import PosCart from './PosCart';
import { Toast } from '@/context/ToastContext';

export default function POS() {
  const { currentUser } = useAuth();
  const {
    items,
    cart,
    lockedMember,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    isLoading,
    isSubmitting,
    totalAmount,
    lookupMember,
    setLockedMember,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    checkout,
  } = usePOS();

  const handleCheckout = async (paymentMethod: string) => {
    if (!currentUser) {
      Toast.show({
        title: 'Chưa đăng nhập',
        message: 'Vui lòng đăng nhập với tư cách Lễ tân hoặc Quản lý để lập hóa đơn!',
        variant: 'warning',
      });
      return;
    }

    await checkout(currentUser.id, paymentMethod);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-5 h-[calc(100vh-135px)]">
      {/* Cột trái: Lưới sản phẩm & Gói tập */}
      <PosProductGrid
        items={items}
        selectedCategory={selectedCategory}
        searchQuery={searchQuery}
        isLoading={isLoading}
        onSelectCategory={setSelectedCategory}
        onSearchChange={setSearchQuery}
        onAddToCart={addToCart}
      />

      {/* Cột phải: Khung hóa đơn & Chốt đơn */}
      <PosCart
        cart={cart}
        totalAmount={totalAmount}
        lockedMember={lockedMember}
        isSubmitting={isSubmitting}
        onUpdateQuantity={updateQuantity}
        onRemove={removeFromCart}
        onClearCart={clearCart}
        onLookupMember={lookupMember}
        onClearMember={() => setLockedMember(null)}
        onCheckout={handleCheckout}
      />
    </div>
  );
}
