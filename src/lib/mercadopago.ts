import { MercadoPagoConfig, Payment, Preference } from 'mercadopago';

const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN || '';

export const mpConfig = new MercadoPagoConfig({
  accessToken: accessToken,
  options: { timeout: 10000 }
});

export const paymentClient = new Payment(mpConfig);
export const preferenceClient = new Preference(mpConfig);
