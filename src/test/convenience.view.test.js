import ConvenienceView from '../convenience/convenience.view.js';
import { getLogSpy } from './utils.js';

describe('ConvenienceView', () => {
  let convenienceView;

  beforeEach(() => {
    convenienceView = new ConvenienceView();
  });
  it('welcome 문구를 출력해야 한다', () => {
    const logSpy = getLogSpy();

    convenienceView.printWelcomeMessage();

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(ConvenienceView.MESSAGE.WELCOME));
  });

  it('재고 안내를 시작하는 문구를 출력해야 한다', () => {
    const logSpy = getLogSpy();

    convenienceView.printStocksInfo();

    expect(logSpy).toHaveBeenCalledWith(
      expect.stringContaining(ConvenienceView.MESSAGE.STOCKS_INFO),
    );
  });

  it('재고가 주어지면 보유하고 있는 재고 정보를 출력해야 한다', () => {
    const logSpy = getLogSpy();

    const stocks = {
      콜라: {
        default: { price: 1000, quantitiy: 10 },
        promotion: { price: 1000, quantitiy: 10, promotion: '탄산2+1' },
      },
      탄산수: {
        default: { price: 1200, quantitiy: 0 },
        promotion: { price: 1200, quantitiy: 5, promotion: '탄산2+1' },
      },
      물: {
        default: { price: 500, quantitiy: 10 },
        promotion: null,
      },
    };

    convenienceView.printStocks(stocks);

    const result =
      '- 콜라 1,000원 10개 탄산2+1\n- 콜라 1,000원 10개\n- 탄산수 1,200원 5개 탄산2+1\n- 탄산수 1,200원 재고 없음\n- 물 500원 10개';

    expect(logSpy).toHaveBeenCalledWith(expect.stringContaining(result));
  });
});
