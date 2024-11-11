/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { parseMarkdownFileContents } from '../lib/utils.js';

class StockModel {
  #stock = {};

  static FORMAT = {
    CATEGORY: 'name,price,quantity,promotion',
    DEFAULT: (stockName, defaultStock) =>
      `${stockName},${defaultStock.price},${defaultStock.quantity},null`,
    PROMOTION: (stockName, promotion) =>
      `${stockName},${promotion.price},${promotion.quantity},${promotion.promotion}`,
  };

  #initializeStock(parsedStock) {
    parsedStock.forEach((stock) => {
      const [stockName] = stock;

      this.#stock[stockName] = {
        default: { price: 0, quantity: 0 },
        promotion: null,
      };
    });
  }

  #fillDefaultStockInPromotion(stock) {
    const [stockName, stockPrice, _, stockPromotion] = stock;

    if (stockPromotion === 'null') return;

    this.#stock[stockName].default = {
      price: Number(stockPrice),
      quantity: 0,
    };
  }

  #fillPromotionStockInPromotion(stock) {
    const [stockName, stockPrice, stockQuantity, stockPromotion] = stock;

    if (stockPromotion === 'null') return;

    this.#stock[stockName].promotion = {
      price: Number(stockPrice),
      quantity: Number(stockQuantity),
      promotion: stockPromotion,
    };
  }

  #fillStockInPromotion(stock) {
    this.#fillDefaultStockInPromotion(stock);
    this.#fillPromotionStockInPromotion(stock);
  }

  #fillStockInDefault(stock) {
    const [stockName, stockPrice, stockQuantity, stockPromotion] = stock;

    if (stockPromotion !== 'null') return;

    this.#stock[stockName].default.price = Number(stockPrice);
    this.#stock[stockName].default.quantity = Number(stockQuantity);
  }

  #fillStock(parsedStock) {
    parsedStock.forEach((stock) => {
      this.#fillStockInPromotion(stock);
      this.#fillStockInDefault(stock);
    });
  }

  setStock(stock) {
    const parsedStock = parseMarkdownFileContents(stock);

    this.#initializeStock(parsedStock);
    this.#fillStock(parsedStock);
  }

  getStock() {
    return this.#stock;
  }

  #updateDefaultStock(name, quantity) {
    if (this.#stock[name].promotion === null) {
      this.#stock[name].default.quantity -= quantity;
    }
  }

  #updatePromotionStock(name, quantity) {
    if (this.#stock[name].promotion === null) return;

    if (this.#stock[name].promotion.quantity > 0) {
      this.#stock[name].promotion.quantity -= quantity;
    }

    if (this.#stock[name].promotion.quantity < 0) {
      this.#stock[name].default.quantity += this.#stock[name].promotion.quantity;
      this.#stock[name].promotion.quantity = 0;
    }
  }

  updateStock(purchaseInfo) {
    for (const { name, quantity } of purchaseInfo) {
      this.#updateDefaultStock(name, quantity);
      this.#updatePromotionStock(name, quantity);
    }
  }

  #convertPromotionStock(products, stockName, promotion) {
    if (promotion && promotion.quantity > 0) {
      products.push(StockModel.FORMAT.PROMOTION(stockName, promotion));
    }
  }

  #convertDefaultStock(products, stockName, defaultStock) {
    if (defaultStock.quantity > 0) {
      products.push(StockModel.FORMAT.DEFAULT(stockName, defaultStock));
    }
  }

  convertStockToText() {
    const products = [StockModel.FORMAT.CATEGORY];

    Object.keys(this.#stock).forEach((stockName) => {
      const { default: defaultStock, promotion } = this.#stock[stockName];

      this.#convertPromotionStock(products, stockName, promotion);
      this.#convertDefaultStock(products, stockName, defaultStock);
    });

    return products;
  }
}

export default StockModel;
