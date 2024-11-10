/* eslint-disable no-await-in-loop */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import { read } from '../lib/file.js';
import ConvenienceModel from './convenience.model.js';
import ConvenienceView from './convenience.view.js';

class ConvenienceController {
  #view;

  #model;

  constructor(view = new ConvenienceView(), model = new ConvenienceModel()) {
    this.#view = view;
    this.#model = model;

    this.#model.setStockInfo(read('../../public/products.md'));
    this.#model.setPromotionInfo(read('../../public/promotions.md'));
  }

  async init() {
    this.#view.printWelcomeMessage();

    this.#view.printStocksInfo();

    this.#view.printStocks(this.#model.getStocks());

    const purchaseInfo = await this.#view.getPurcharseInfo();
    this.#view.printLineBreak();

    this.#model.validatePurchaseInfo(purchaseInfo);
    const parsedPurchaseInfo = this.#model.parsePurchaseInfo(purchaseInfo);

    // 프로모션 적용이 가능한 상품에 대해 고객이 해당 수량보다 적게 가져온 경우
    const promotableItems = this.#model.getPromotableItems(parsedPurchaseInfo);
    const shouldAddItemForPromotionList = [];

    for (const promotableItem of promotableItems) {
      if (promotableItem === null) {
        continue;
      }

      const answer = await this.#view.getShouldAddItemForPromotion(promotableItem);
      this.#view.printLineBreak();

      // answer validation

      if (answer === 'Y') {
        shouldAddItemForPromotionList.push(promotableItem);
      }
    }

    // 증정 받을 수 있는 상품을 추가한다.
    shouldAddItemForPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item);
      parsedPurchaseInfo[itemIndex].quantity += 1;
    });

    // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우
    const nonPromotionalItems = this.#model.getNonPromotionalItems(parsedPurchaseInfo);
    const shouldAddItemWithoutPromotionList = [];

    for (const nonPromotionalItem of nonPromotionalItems) {
      if (nonPromotionalItem === null) {
        continue;
      }

      const answer = await this.#view.getShouldAddItemWithoutPromotion(
        nonPromotionalItem.name,
        nonPromotionalItem.quantity,
      );
      this.#view.printLineBreak();

      if (answer === 'N') {
        shouldAddItemWithoutPromotionList.push({
          name: nonPromotionalItem.name,
          quantity: nonPromotionalItem.quantity,
        });
      }
    }

    // 정가로 결제해야하는 수량만큼 제외한 후 결제를 진행한다.
    shouldAddItemWithoutPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item.name);
      parsedPurchaseInfo[itemIndex].quantity -= item.quantity;
    });

    const isMembershipDiscount = await this.#view.getIsMembershipDiscount();

    const receipt = this.#model.getReceipt(parsedPurchaseInfo, isMembershipDiscount);

    this.#view.printReceipt(receipt);
  }
}

export default ConvenienceController;
