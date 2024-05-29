import { useEffect, useState } from "react";
import { supabaseClient } from "./supabaseClient";


export type AppConstant = {
    value: string,
    label: string
}
const cache: Record<string, AppConstant[]> = {}

const useAppConstants = (type: string) => {
    const [status, setStatus] = useState('idle');
    const [data, setData] = useState<AppConstant[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            setStatus('fetching');
            if (cache[type]) {
                const data = cache[type];
                setData(data);
                setStatus('fetched');
            } else {
                const response = await supabaseClient.from('app_constants')
                    .select()
                    .eq('type', type);
                const data = response.data as AppConstant[];
                cache[type] = data;
                setData(data);
                setStatus('fetched');
            }
        };

        fetchData();
    }, [type]);

    return { status, data };
};

export default useAppConstants;