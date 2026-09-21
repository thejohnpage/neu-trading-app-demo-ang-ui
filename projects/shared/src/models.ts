export interface Instrument { instrumentId:string; symbol:string; instrumentType:string; exchange:string|null; baseCurrency:string|null; quoteCurrency:string; name:string; tradable:boolean; }
export interface Quote { instrumentId:string; symbol:string; quoteCurrency:string; bid:number; ask:number; source:string; quotedAt:string; }
export interface Account { accountId:string; accountNumber:string; baseCurrency:string; status:string; }
export interface CashBalance { accountId:string; currency:string; balance:number; updatedAt:string; }
export interface CashTransaction { transactionId:string; accountId:string; orderId:string|null; currency:string; amount:number; type:string; createdAt:string; }
export interface FxRate { fromCurrency:string; toCurrency:string; rate:number; source:string; quotedAt:string; }
export interface CashConversion { fromCurrency:string; toCurrency:string; debitedAmount:number; creditedAmount:number; rate:number; source:string; }
export interface Position { accountId:string; instrumentId:string; symbol:string; instrumentType:string; quantity:number; updatedAt:string; }
export interface Order { orderId:string; accountId:string; instrumentId:string; side:'BUY'|'SELL'; quantity:number; status:string; submittedAt:string; acceptedAt:string|null; }
export interface OrderEvent { eventId:number; eventType:string; eventTime:string; details:string; }
export interface ReportSummary { trade_count:number; total_quantity:number; total_notional:number; instruments_traded:number; active_clients:number; warehouse_last_loaded_at:string|null; }
export interface TradeActivity { order_id:string; client_segment:string|null; account_number:string; symbol:string; instrument_type:string; side:string; quantity:number; execution_price:number; notional:number; currency:string; filled_at:string; loaded_at:string; }
export interface InstrumentReport { symbol:string; instrument_type:string; trade_count:number; total_quantity:number; total_notional:number; average_execution_price:number; }
export interface ClientSegmentReport { client_segment:string; trade_count:number; clients:number; total_quantity:number; total_notional:number; }
export interface VolumeReport { trade_date:string; trade_count:number; total_quantity:number; total_notional:number; }
