class ReceiptModel {
  #receipt = {};

  #stock;

  #promotion;

  constructor(stock, promotion) {
    this.#stock = stock;
    this.#promotion = promotion;
  }

  #initializeReceipt() {
    this.#receipt = {
      purchaseInfo: [],
      promotionInfo: [],
      totalPurchasePrice: { quantity: 0, price: 0 },
      promotionDiscountPrice: 0,
      membershipDiscountPrice: 0,
      amountDue: 0,
    };
  }

  #addPurchaseInfoToReceipt(purchaseInfo) {
    const { name, quantity } = purchaseInfo;

    this.#receipt.purchaseInfo.push({
      name,
      quantity,
      price: quantity * this.#stock.getStock()[name].default.price,
    });
  }

  #addTotalPurchasePriceToReceipt(purchaseInfo) {
    const { name, quantity } = purchaseInfo;

    this.#receipt.totalPurchasePrice.quantity += quantity;
    this.#receipt.totalPurchasePrice.price += quantity * this.#stock.getStock()[name].default.price;
  }

  #addPromotionInfoToReceipt(purchaseInfo) {
    const promotionInfo = this.#promotion.getPromotion(purchaseInfo);

    if (promotionInfo) {
      this.#receipt.promotionInfo.push(promotionInfo);
    }
  }

  #addBasicInfoToReceipt(parsedPurchaseInfo) {
    parsedPurchaseInfo.forEach((info) => {
      this.#addPurchaseInfoToReceipt(info);
      this.#addTotalPurchasePriceToReceipt(info);
      this.#addPromotionInfoToReceipt(info);
    });
  }

  #addPromotionDiscountPriceToReceipt() {
    this.#receipt.promotionInfo.forEach((info) => {
      this.#receipt.promotionDiscountPrice +=
        info.quantity * this.#stock.getStock()[info.name].default.price;
    });
  }

  #calculateMembershipDiscountPrice() {
    const membershipDiscountPrice =
      (this.#receipt.totalPurchasePrice.price - this.#receipt.promotionDiscountPrice) * 0.3;

    if (membershipDiscountPrice > 8000) {
      return 8000;
    }

    return membershipDiscountPrice;
  }

  #addMembershipDiscountPriceToReceipt(isMembershipDiscount) {
    if (isMembershipDiscount === 'Y') {
      this.#receipt.membershipDiscountPrice = this.#calculateMembershipDiscountPrice();
    }
  }

  #addDiscountInfoToReceipt(isMembershipDiscount) {
    this.#addPromotionDiscountPriceToReceipt();
    this.#addMembershipDiscountPriceToReceipt(isMembershipDiscount);
  }

  #addAmountDueToReceipt() {
    this.#receipt.amountDue =
      this.#receipt.totalPurchasePrice.price -
      this.#receipt.promotionDiscountPrice -
      this.#receipt.membershipDiscountPrice;
  }

  #generateReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    this.#initializeReceipt();

    this.#addBasicInfoToReceipt(parsedPurchaseInfo);
    this.#addDiscountInfoToReceipt(isMembershipDiscount);
    this.#addAmountDueToReceipt();
  }

  getReceipt(parsedPurchaseInfo, isMembershipDiscount) {
    this.#generateReceipt(parsedPurchaseInfo, isMembershipDiscount);

    return this.#receipt;
  }
}

export default ReceiptModel;
