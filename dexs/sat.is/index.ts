import fetchURL from "../../utils/fetchURL";
import {AxiosResponse} from "axios";
import {FetchResult, SimpleAdapter} from "../../adapters/types";
import {CHAIN} from "../../helpers/chains";

type ProductType = {
    id: string;
}

type TickerType = {
    time: string;
    volume_24h: string;
}

const ENDPOINT = "https://api.sat.is/api";
const productsEndpoint = `${ENDPOINT}/products`;
const tickerEndpoint = `${ENDPOINT}/products/{0}/ticker`;

const urlFormatter = (url: string, ...args: string[]): string =>
    args.reduce((prev: string, data: string, index: number) =>
            prev.replace(`{${index}}`, data),
        url
    )


const fetch = () => async (timestamp: number): Promise<FetchResult> => {
    const allProducts: ProductType[] = (
        await fetchURL(productsEndpoint)
    ).data;

    const tickerPromise: Promise<AxiosResponse<TickerType, unknown>>[] =
        allProducts.map((p: ProductType) =>
            fetchURL(urlFormatter(tickerEndpoint, p.id))
        )

    const allTickers = await Promise.all(tickerPromise);

    return {
        dailyVolume: allTickers.reduce(
            (prev: number, curr: AxiosResponse<TickerType, unknown>) =>
                prev + +(curr.data.volume_24h ?? 0)
        , 0).toString(),
        timestamp
    }
}

const adapter: SimpleAdapter = {
    adapter: {
        [CHAIN.ZKSYNC]: {
            fetch: fetch(),
            start: async () => 1689552000
        }
    }
}


export default adapter;
