

import { useEffect, useState } from "react";
import "../css/ShopPage.css";
import {
  getShopData,
  buySticker,
  equipSticker,
  type ShopDataRes,
  type StickerItem
} from "../../../api/shop";
import { getProfileId } from "../../../store/storage";
import { useSnackbar } from "notistack";

export default function ShopPage() {
  const { enqueueSnackbar } = useSnackbar();
  const profileId = getProfileId();
  
  const [data, setData] = useState<ShopDataRes | null>(null);
  const [loading, setLoading] = useState(true);
  
  // --- State quản lý Tab ---
  const [view, setView] = useState<"shop" | "collection">("shop");
  const [activeCatId, setActiveCatId] = useState<number | "ALL">("ALL");
  
  // --- State quản lý Modal và Loading ---
  const [selectedSticker, setSelectedSticker] = useState<StickerItem | null>(null); // Nếu khác null -> hiện modal
  const [isBuying, setIsBuying] = useState(false); // Loading khi đang gọi API mua
  const [isEquippingId, setIsEquippingId] = useState<number | null>(null); // Loading khi đang đổi avatar

  // 1. Fetch dữ liệu ban đầu
  useEffect(() => {
    fetchData();
  }, [profileId]);

  const fetchData = async () => {
    if (!profileId) return;
    try {
      setLoading(true);
      const res = await getShopData(profileId);
      setData(res);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Xử lý khi nhấn nút "Đổi" (Mở Modal)
  const handleBuyClick = (sticker: StickerItem) => {
    if (!data) return;
    
    // Kiểm tra đủ tiền không
    if (data.currentBalance < sticker.price) {
      enqueueSnackbar("Bạn chưa đủ điểm để đổi quà này! Hãy học thêm nhé.", { variant: "warning" });
      return;
    }
    
    // Mở modal xác nhận
    setSelectedSticker(sticker); 
  };

  // 3. Xử lý xác nhận mua (Gọi API)
  const handleConfirmExchange = async () => {
    if (!profileId || !selectedSticker) return;

    setIsBuying(true);
    try {
      await buySticker(profileId, selectedSticker.id);
      enqueueSnackbar("Đổi quà thành công!", { variant: "success" });
      
      // Đóng modal & reload dữ liệu
      setSelectedSticker(null); 
      await fetchData(); 
    } catch (e: any) {
      enqueueSnackbar(e.message || "Đổi quà thất bại", { variant: "error" });
    } finally {
      setIsBuying(false);
    }
  };

  // 4. Xử lý thay avatar (Gọi API)
  const handleEquip = async (stickerId: number) => {
    if (!profileId) return;
    setIsEquippingId(stickerId);
    try {
      await equipSticker(profileId, stickerId);
      enqueueSnackbar("Đã thay ảnh đại diện mới!", { variant: "success" });
      // Reload trang để cập nhật Avatar trên Header (hoặc dùng Context nếu có)
      window.location.reload(); 
    } catch (e: any) {
      enqueueSnackbar(e.message || "Lỗi cập nhật ảnh đại diện", { variant: "error" });
    } finally {
      setIsEquippingId(null);
    }
  };

  // 5. Logic lọc danh sách Sticker để hiển thị
  const getDisplayStickers = () => {
    if (!data) return [];
    
    // Bước 1: Lấy nguồn (Tất cả hay Túi đồ)
    let source: StickerItem[] = [];
    if (view === "shop") {
       // Tab Shop: Lấy tất cả sticker từ các category
       source = data.categories.flatMap(c => c.stickers);
    } else {
       // Tab Collection: Chỉ lấy những sticker đã sở hữu
       const all = data.categories.flatMap(c => c.stickers);
       source = all.filter(s => data.ownedStickerIds.includes(s.id));
    }

    // Bước 2: Lọc theo Category (nếu đang chọn 1 category cụ thể)
    if (activeCatId !== "ALL") {
       const catGroup = data.categories.find(c => c.id === activeCatId);
       if (catGroup) {
          const catStickerIds = catGroup.stickers.map(s => s.id);
          return source.filter(s => catStickerIds.includes(s.id));
       }
       return [];
    }

    return source;
  };

  if (loading) return <div className="shop-msg">Đang tải cửa hàng...</div>;
  if (!data) return <div className="shop-msg">Lỗi tải dữ liệu.</div>;

  const stickersToShow = getDisplayStickers();

  return (
    <div className="shop-wrap">
      {/* --- HEADER --- */}
      <div className="shop-header">
        <div className="shop-header-title">
          <h1>CỬA HÀNG ĐỔI QUÀ</h1>
          <p>Dùng điểm thưởng để đổi Sticker độc đáo!</p>
        </div>
        <div className="shop-balance">
          <span>💎</span> {data.currentBalance}
        </div>
      </div>

      {/* --- TAB CHÍNH (Cửa hàng / Túi đồ) --- */}
      <div className="shop-tabs">
         <button 
            className={`shop-tab ${view === "shop" ? "active" : ""}`} 
            onClick={() => { setView("shop"); setActiveCatId("ALL"); }}
         >
            Cửa hàng
         </button>
         <button 
            className={`shop-tab ${view === "collection" ? "active" : ""}`} 
            onClick={() => { setView("collection"); setActiveCatId("ALL"); }}
         >
            Bộ sưu tập của bạn ({data.ownedStickerIds.length})
         </button>
      </div>

      {/* --- TAB DANH MỤC (Lọc theo loại) --- */}
      <div className="shop-tabs" style={{ marginTop: -12, borderBottom: 'none' }}>
         <button 
            className={`shop-tab ${activeCatId === "ALL" ? "active" : ""}`} 
            onClick={() => setActiveCatId("ALL")}
         >
            Tất cả
         </button>
         {data.categories.map(cat => (
             <button 
                key={cat.id} 
                className={`shop-tab ${activeCatId === cat.id ? "active" : ""}`} 
                onClick={() => setActiveCatId(cat.id)}
             >
                {cat.name}
             </button>
         ))}
      </div>

      {/* --- GRID DANH SÁCH STICKER --- */}
      {stickersToShow.length === 0 ? (
        <div className="shop-msg">
            {view === "collection" 
                ? "Bạn chưa có sticker nào thuộc mục này." 
                : "Mục này chưa có sticker nào."}
        </div>
      ) : (
        <div className="shop-grid">
            {stickersToShow.map((sticker) => {
              const isOwned = data.ownedStickerIds.includes(sticker.id);
              const isAffordable = data.currentBalance >= sticker.price;
              
              return (
                <div key={sticker.id} className={`sticker-card ${sticker.rarity}`}>
                  <div className="sticker-badge">{sticker.rarity}</div>
                  <img src={sticker.imageUrl} alt={sticker.name} className="sticker-img" />
                  <div className="sticker-name">{sticker.name}</div>
                  
                  {/* Logic hiển thị nút bấm */}
                  {!isOwned ? (
                    <button 
                      className="shop-btn buy" 
                      onClick={() => handleBuyClick(sticker)}
                      disabled={!isAffordable}
                    >
                      {`Đổi ${sticker.price} 💎`}
                    </button>
                  ) : (
                    view === "collection" ? (
                      <button 
                        className="shop-btn equip"
                        onClick={() => handleEquip(sticker.id)}
                        disabled={isEquippingId === sticker.id}
                      >
                        {isEquippingId === sticker.id ? "Đang thay..." : "Dùng Avatar"}
                      </button>
                    ) : (
                      <button className="shop-btn owned" disabled>Đã sở hữu</button>
                    )
                  )}
                </div>
              );
            })}
        </div>
      )}

      {/* --- MODAL XÁC NHẬN ĐỔI QUÀ --- */}
      {selectedSticker && (
        <div className="shop-modal-overlay">
          <div className="shop-modal">
            <div className="shop-modal-title">Xác nhận đổi quà</div>
            <p className="shop-modal-desc">
              Bạn có chắc chắn muốn dùng điểm để đổi lấy sticker này không?
            </p>
            
            <div className="shop-modal-preview">
              <img src={selectedSticker.imageUrl} alt={selectedSticker.name} className="shop-modal-img" />
              <div className="shop-modal-name">{selectedSticker.name}</div>
              <div className="shop-modal-price">
                💎 {selectedSticker.price}
              </div>
            </div>

            <div className="shop-modal-actions">
              <button 
                className="shop-modal-btn cancel" 
                onClick={() => setSelectedSticker(null)}
                disabled={isBuying}
              >
                Hủy bỏ
              </button>
              <button 
                className="shop-modal-btn confirm" 
                onClick={handleConfirmExchange}
                disabled={isBuying}
              >
                {isBuying ? "Đang đổi..." : "Đổi ngay"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}