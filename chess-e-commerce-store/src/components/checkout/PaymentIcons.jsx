import React from "react";

const iconStyle = { display: "block" };

export function VisaIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 64 24"
      width={size}
      height={(size * 24) / 64}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Visa"
    >
      <path
        fill="#1A1F71"
        d="M23.5 2.4L18.2 21.6h-4.4L11 6.9c-.2-.9-.4-1.3-1.1-1.7-1.2-.6-3.1-1.2-4.8-1.6l.1-.5h7.1c.9 0 1.7.6 1.9 1.6l2.1 11.2 5.2-13h4zm12.9 12.9c0-4.1-5.7-4.4-5.7-6.2 0-.6.5-1.2 1.7-1.3.6-.1 2.2-.1 4.1.7l.7-3.3c-1-.4-2.3-.8-3.9-.8-4.1 0-7 2.2-7 5.3 0 2.3 2.1 3.6 3.6 4.4 1.6.8 2.1 1.3 2.1 2 0 1.1-1.3 1.6-2.5 1.6-2.1 0-3.3-.6-4.3-1l-.8 3.5c1 .5 2.9.9 4.9 1 4.4 0 7.2-2.2 7.2-5.9zm10.9 6.3H51L47.6 2.4h-3.6c-.8 0-1.5.5-1.8 1.2l-6.4 18h4.4l.9-2.4h5.4l.5 2.4zm-4.6-5.8l2.2-6 1.3 6h-3.5zM29.5 2.4l-3.5 19.2h-4.2l3.5-19.2h4.2z"
      />
    </svg>
  );
}

export function MastercardIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 48 30"
      width={size}
      height={(size * 30) / 48}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Mastercard"
    >
      <circle cx="18" cy="15" r="12" fill="#EB001B" />
      <circle cx="30" cy="15" r="12" fill="#F79E1B" />
      <path
        fill="#FF5F00"
        d="M24 5.5c2.9 2.4 4.7 6 4.7 9.9s-1.8 7.5-4.7 9.9c-2.9-2.4-4.7-6-4.7-9.9s1.8-7.5 4.7-9.9z"
      />
    </svg>
  );
}

export function MadaIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 100 40"
      width={size}
      height={(size * 40) / 100}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Mada"
    >
      <rect width="100" height="40" rx="6" fill="#231F20" />
      <rect x="4" y="4" width="92" height="32" rx="4" fill="#FFFFFF" />
      <text
        x="50"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="12"
        fontWeight="900"
        fill="#231F20"
      >
        m ada
      </text>
      <text
        x="50"
        y="31"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="7"
        fontWeight="700"
        fill="#84BD00"
        letterSpacing="1"
      >
        مدى
      </text>
    </svg>
  );
}

export function ApplePayIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 64 26"
      width={size}
      height={(size * 26) / 64}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Apple Pay"
    >
      <rect width="64" height="26" rx="4" fill="#000000" />
      <path
        fill="#FFFFFF"
        d="M14.6 8.6c-.5.6-1.3 1-2.1.9-.1-.8.3-1.7.8-2.3.5-.6 1.4-1 2.1-1.1.1.9-.2 1.8-.8 2.5zm.8.9c-1.2 0-2.2.7-2.7.7-.6 0-1.4-.6-2.3-.6-1.2 0-2.3.7-2.9 1.8-1.3 2.2-.3 5.4.9 7.2.6.9 1.4 1.9 2.4 1.8.9 0 1.3-.6 2.4-.6s1.4.6 2.4.6c1 0 1.6-.9 2.2-1.8.7-1 1-2 1-2 0 0-1.9-.7-1.9-2.8 0-1.8 1.4-2.6 1.5-2.7-.9-1.2-2.2-1.6-2.6-1.6h-.4zm7 .7v9.8h1.6v-3.4h2.1c1.9 0 3.3-1.3 3.3-3.2s-1.3-3.2-3.2-3.2h-3.8zm1.6 1.3h1.8c1.3 0 2 .7 2 1.9s-.7 1.9-2 1.9h-1.8v-3.8zm8.6 8.6c1 0 1.9-.5 2.4-1.3v1.2h1.5v-5c0-1.5-1.2-2.5-3.1-2.5-1.7 0-3 1-3 2.4h1.4c.1-.7.8-1.1 1.6-1.1 1.1 0 1.7.5 1.7 1.4v.6l-2.1.1c-2 .1-3 .9-3 2.3.1 1.3 1.2 2.2 2.6 2.2v-.3zm.5-1.2c-.9 0-1.5-.4-1.5-1.1 0-.7.6-1.1 1.6-1.2l1.9-.1v.6c-.1 1-.9 1.8-2 1.8zm5.5 3.5c1.6 0 2.4-.6 3.1-2.6l2.9-8.2h-1.6l-2 6.3h-.1l-1.9-6.3H37l2.8 7.9-.1.5c-.3.7-.7 1-1.4 1-.1 0-.4 0-.5 0v1.2c.1.1.5.2.7.2z"
      />
    </svg>
  );
}

export function StcPayIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 90 40"
      width={size}
      height={(size * 40) / 90}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="STC Pay"
    >
      <rect width="90" height="40" rx="6" fill="#4F008C" />
      <text
        x="45"
        y="19"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="900"
        fill="#FFFFFF"
        letterSpacing="1"
      >
        stc pay
      </text>
      <text
        x="45"
        y="31"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="9"
        fontWeight="700"
        fill="#F5A623"
      >
        اس تي سي باي
      </text>
    </svg>
  );
}

export function GooglePayIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 90 40"
      width={size}
      height={(size * 40) / 90}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Google Pay"
    >
      <rect width="90" height="40" rx="6" fill="#FFFFFF" stroke="#DADCE0" />
      <text
        x="12"
        y="26"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="700"
      >
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC04">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text
        x="60"
        y="26"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="700"
        fill="#5F6368"
      >
        Pay
      </text>
    </svg>
  );
}

export function SamsungPayIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 100 40"
      width={size}
      height={(size * 40) / 100}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Samsung Pay"
    >
      <rect width="100" height="40" rx="6" fill="#1428A0" />
      <text
        x="50"
        y="25"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="11"
        fontWeight="800"
        fill="#FFFFFF"
        letterSpacing="0.5"
      >
        SAMSUNG Pay
      </text>
    </svg>
  );
}

export function TamaraIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 100 40"
      width={size}
      height={(size * 40) / 100}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Tamara"
    >
      <rect width="100" height="40" rx="6" fill="#FDF0E4" />
      <text
        x="50"
        y="20"
        textAnchor="middle"
        fontFamily="Georgia, serif"
        fontSize="14"
        fontWeight="700"
        fontStyle="italic"
        fill="#E64F27"
      >
        tamara
      </text>
      <text
        x="50"
        y="32"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#8A3F1E"
      >
        اشتر الآن، ادفع لاحقاً
      </text>
    </svg>
  );
}

export function TabbyIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 100 40"
      width={size}
      height={(size * 40) / 100}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Tabby"
    >
      <rect width="100" height="40" rx="6" fill="#3BFFC1" />
      <text
        x="50"
        y="20"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="14"
        fontWeight="900"
        fill="#292929"
      >
        tabby
      </text>
      <text
        x="50"
        y="32"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="8"
        fontWeight="700"
        fill="#292929"
      >
        قسّمها على 4
      </text>
    </svg>
  );
}

export function CashIcon({ size = 40 }) {
  return (
    <svg
      viewBox="0 0 64 40"
      width={size}
      height={(size * 40) / 64}
      xmlns="http://www.w3.org/2000/svg"
      style={iconStyle}
      aria-label="Cash on Delivery"
    >
      <rect width="64" height="40" rx="6" fill="#0F1115" />
      <rect x="4" y="4" width="56" height="32" rx="3" fill="#F8F7F4" />
      <circle cx="32" cy="20" r="9" fill="none" stroke="#B8962E" strokeWidth="1.6" />
      <text
        x="32"
        y="24"
        textAnchor="middle"
        fontFamily="Arial, sans-serif"
        fontSize="10"
        fontWeight="800"
        fill="#B8962E"
      >
        ر.س
      </text>
    </svg>
  );
}

export const PAYMENT_ICONS = {
  cash: CashIcon,
  visa: VisaIcon,
  mastercard: MastercardIcon,
  mada: MadaIcon,
  apple_pay: ApplePayIcon,
  stc_pay: StcPayIcon,
  google_pay: GooglePayIcon,
  samsung_pay: SamsungPayIcon,
  tamara: TamaraIcon,
  tabby: TabbyIcon,
};
