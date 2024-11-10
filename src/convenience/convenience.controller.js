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
  }

  #openConvenience() {
    this.#model.setStock(read('../../public/products.md'));
    this.#model.setPromotion(read('../../public/promotions.md'));
  }

  #guideConvenience() {
    this.#view.printWelcomeMessage();
    this.#view.printStocksInfo();
    this.#view.printStocks(this.#model.getStocks());
  }

  async #readPurchaseInfo() {
    const purchaseInfo = await this.#view.getPurcharseInfo();
    this.#model.validatePurchaseInfo(purchaseInfo);

    this.#view.printLineBreak();

    return this.#model.parsePurchaseInfo(purchaseInfo);
  }

  async #readShouldAddItemForPromotion(promotableItem) {
    const answer = await this.#view.getShouldAddItemForPromotion(promotableItem);
    // answer validation
    this.#view.printLineBreak();

    return answer;
  }

  async #readShouldAddItemWithoutPromotion(name, quantity) {
    const answer = await this.#view.getShouldAddItemWithoutPromotion(name, quantity);
    // answer validation
    this.#view.printLineBreak();

    return answer;
  }

  async #processPromotableItems(parsedPurchaseInfo) {
    const promotableItems = this.#model.getPromotableItems(parsedPurchaseInfo);
    const shouldAddItemForPromotionList = [];

    for (const promotableItem of promotableItems) {
      if (promotableItem === null) {
        continue;
      }

      const answer = await this.#readShouldAddItemForPromotion(promotableItem);

      if (answer === 'Y') {
        shouldAddItemForPromotionList.push(promotableItem);
      }
    }

    // 증정 받을 수 있는 상품을 추가한다.
    shouldAddItemForPromotionList.forEach((item) => {
      const itemIndex = parsedPurchaseInfo.findIndex((info) => info.name === item);
      // eslint-disable-next-line no-param-reassign
      parsedPurchaseInfo[itemIndex].quantity += 1;
    });
  }

  async #processNonPromotionalItems(parsedPurchaseInfo) {
    // 프로모션 재고가 부족하여 일부 수량을 프로모션 혜택 없이 결제해야 하는 경우
    const nonPromotionalItems = this.#model.getNonPromotionalItems(parsedPurchaseInfo);
    const shouldAddItemWithoutPromotionList = [];

    for (const nonPromotionalItem of nonPromotionalItems) {
      if (nonPromotionalItem === null) {
        continue;
      }

      const answer = await this.#readShouldAddItemWithoutPromotion(
        nonPromotionalItem.name,
        nonPromotionalItem.quantity,
      );

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
      // eslint-disable-next-line no-param-reassign
      parsedPurchaseInfo[itemIndex].quantity -= item.quantity;
    });
  }

  async init() {
    this.#openConvenience();
    this.#guideConvenience();

    const parsedPurchaseInfo = await this.#readPurchaseInfo();

    await this.#processPromotableItems(parsedPurchaseInfo);
    await this.#processNonPromotionalItems(parsedPurchaseInfo);

    const isMembershipDiscount = await this.#view.getIsMembershipDiscount();

    const receipt = this.#model.getReceipt(parsedPurchaseInfo, isMembershipDiscount);

    this.#view.printReceipt(receipt);
  }
}

export default ConvenienceController;
