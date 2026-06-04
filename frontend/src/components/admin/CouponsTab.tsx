import { useState, useEffect } from "react";
import { loadCoupons, saveCoupons, type Coupon } from "@/utils/contentStore";
import { ADMIN_INPUT_CLASS } from "./adminUtils";

export function CouponsTab({ handlePostSave }: { handlePostSave: () => void }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);

  useEffect(() => { setCoupons(loadCoupons()); }, []);

  return (
    <article className="sia-card bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
      <h2 className="text-2xl font-bold text-[#600694] mb-6">Generate Coupon</h2>
      
      <form
        className="grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          const data = new FormData(event.currentTarget);
          const next: Coupon = {
            code: String(data.get("code") ?? "").toUpperCase(),
            discount: Number(data.get("discount") ?? 0),
            type: String(data.get("type") ?? "percent") === "fixed" ? "fixed" : "percent",
          };
          
          // Remove old coupon with same code if it exists, then add new one
          const updated = [...coupons.filter((item) => item.code !== next.code), next];
          
          setCoupons(updated); 
          saveCoupons(updated);
          window.dispatchEvent(new Event("sia-content-updated"));
          
          // Reset the form
          (event.target as HTMLFormElement).reset();
          handlePostSave();
        }}
      >
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Coupon Code</label>
          <input name="code" required placeholder="e.g. SIA20" className={ADMIN_INPUT_CLASS} />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Discount Value</label>
          <input name="discount" required type="number" min={1} placeholder="e.g. 20" className={ADMIN_INPUT_CLASS} />
        </div>
        
        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted-foreground">Discount Type</label>
          <select name="type" className={ADMIN_INPUT_CLASS}>
            <option value="percent">Percentage (%)</option>
            <option value="fixed">Fixed Amount ($/₹)</option>
          </select>
        </div>
        
        <div className="flex items-end md:col-span-1">
          <button type="submit" className="bg-[#600694] text-white w-full h-12 rounded-full font-bold hover:bg-[#4a0473] transition-all">
            SAVE COUPON
          </button>
        </div>
      </form>
      
      {coupons.length > 0 && (
        <div className="mt-8 space-y-3 border-t border-gray-100 pt-6">
           <p className="text-xs uppercase tracking-[0.06em] text-muted-foreground">
            Active Coupons
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {coupons.map((coupon) => (
              <div key={coupon.code} className="flex items-center justify-between rounded-2xl border border-gray-100 bg-gray-50/50 p-4 text-sm">
                <span className="font-bold text-[#600694] text-lg">{coupon.code}</span>
                <span className="font-medium text-muted-foreground bg-white px-3 py-1 rounded-full border border-gray-200">
                  {coupon.type === "percent" ? `${coupon.discount}% OFF` : `$${coupon.discount} OFF`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}