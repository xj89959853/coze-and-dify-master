# 基于CozeIDE创建插件

**特点：可以编码，更加灵活**

1. 请求多个数据接口
2. 对数据做二次处理



准备一个查询股票的 URL：

```js
https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${code}&apikey=${apiKey}
```

- code：股票代码，例如
  - AAPL：苹果
  - MSFT：微软
  - AMZN：亚马逊
  - TSLA：特斯拉
  - ....
- apikey：Alpha Vantage 官方文档要求所有请求都带上 `apikey` 参数。注册之后会给你一个免费的 key（比如 `demo`，就是它内置的一个示例 key）。我们可以随便写 apikey，因为：
  - **公共 demo key**：Alpha Vantage 会在没校验到有效 key 时，默认走 `demo` key，返回的是**有限制的测试数据**，而不是实时完整的数据。
    - 举例：即使你传 `apikey=abc123`，后端会 fallback 到 `demo` key。
  - **限流规则**：
    - `demo` key 每分钟和每天都有严格限额（大概 5 次/分钟，500 次/天）。
    - 如果超限，会返回错误或提示升级。
    - 只有申请到的真实 key 才能保证更高配额。

```json
{
    "Global Quote": {
        "01. symbol": "TSLA",
        "02. open": "439.8800",
        "03. high": "440.9700",
        "04. low": "423.7200",
        "05. price": "425.8500",
        "06. volume": "83422691",
        "07. latest trading day": "2025-09-23",
        "08. previous close": "434.2100",
        "09. change": "-8.3600",
        "10. change percent": "-1.9253%"
    }
}
```



元数据：

- 输入参数：code
- 输出参数：code、price



代码如下：

```ts
import { Args } from '@/runtime';
import { Input, Output } from "@/typings/search_stock_prices/search_stock_prices";
import axios from 'axios';
export async function handler({ input, logger }: Args<Input>): Promise<Output> {
  const code  = input.code;
  const apiKey = 'YOUR_ALPHA_VANTAGE_API_KEY';
  const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${code}&apikey=${apiKey}`;
  
  try {
    const response = await axios.get(url);
    const data = response.data['Global Quote'];
    return {
      code: code,
      price: data['05. price'],
    };
  } catch (error) {
    logger.error(`获取${code}的股价出错: ${error}`);
    return {
      code: code,
      price: null,
    };
  }
}
```

---

-EOF-