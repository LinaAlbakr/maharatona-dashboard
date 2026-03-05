'use client';

import { Box } from '@mui/material';
import React from 'react';

type Invoice = any;

/* ------------------ SHARED STYLES ------------------ */

const pStyle: React.CSSProperties = {
  margin: '4px 0',
  lineHeight: '1.4',
  fontSize: 14,
};

const h3Style: React.CSSProperties = {
  margin: '10px 0 6px',
  lineHeight: '1.4',
  fontSize: 17,
  fontWeight: 900,
};

const spanStyle: React.CSSProperties = {
  // margin: '4px 0',
  lineHeight: '1.4',
  fontSize: 15,
  fontWeight: 800,
};

const hrStyle: React.CSSProperties = {
  margin: '10px 0',
};

const thStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  fontWeight: 700,
  fontSize: 14,
  textAlign: 'center',
};

const tdStyle: React.CSSProperties = {
  border: '1px solid #ddd',
  padding: '8px',
  fontSize: 14,
  textAlign: 'center',
};

/* ------------------ COMPONENT ------------------ */

export default function InvoiceHidden({ invoice }: { invoice: Invoice }) {
  if (!invoice) return null;

  return (
    <div
      id="invoice-pdf"
      dir="rtl"
      style={{
        width: '780px', // SAFE A4 width
        padding: '24px',
        background: '#fff',
        fontFamily: 'Arial, Helvetica, sans-serif',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '1100px', // approximate A4 height so footer is at bottom
      }}
    >
      {/* MAIN CONTENT */}
      <div>
        {/* LOGO */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
          <img
            src="/logo/logo.svg"
            alt="Maharatona Logo"
            style={{ maxWidth: 220, height: 100, marginBottom: 4 }}
          />
        </Box>

        {/* TITLE */}
        <h1 style={{ textAlign: 'right', margin: '0 0 8px' }}>الفاتورة</h1>

        {/* META */}
        <p style={pStyle}><span style={spanStyle}>رقم الفاتورة</span>: {invoice.merchant_id}</p>
        <p style={pStyle}><span style={spanStyle}>التاريخ</span>:
          {new Date(invoice.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
          })}
        </p>

        <hr style={hrStyle} />

        {/* SELLER */}
        <h3 style={h3Style}>بيانات البائع</h3>
        <p style={pStyle}><span style={spanStyle}>اسم البائع</span>: مهاراتنا</p>
        <p style={pStyle}>
          <span style={spanStyle}>الاسم التجاري</span>:  مؤسسة مهارات التغيير للدعاية والاعلان
        </p>
        <p style={pStyle}>
          <span style={spanStyle}>السجل التجاري</span>:  1010897761
        </p>
        <p style={pStyle}>
          <span style={spanStyle}>المدينة</span>:  الرياض - المملكة العربية السعودية
        </p>
        <p style={pStyle}>
          <span style={spanStyle}>البريد الإلكتروني</span>: info@maharatona.com
        </p>

        <hr style={hrStyle} />

        {invoice.type === 'package' ? (<>
          <h3 style={h3Style}>بيانات الباقة</h3>
          <p style={pStyle}>
            <span style={spanStyle}>اسم </span>: {invoice.center_id.name}
          </p>
          <p style={pStyle}>
            <span style={spanStyle}>البريد الإلكتروني</span>: {invoice.center_id.email}
          </p>
          <p style={pStyle}>
            <span style={spanStyle}>رقم الجوال</span>: {invoice.center_id.phone.replace(/\+/g, '')}
          </p>
        </>
        ) : (<>
          <h3 style={h3Style}>بيانات الدورة</h3>
          <p style={pStyle}>
            <span style={spanStyle}>اسم </span>: {invoice.client_id.username}
          </p>
          <p style={pStyle}>
            <span style={spanStyle}>البريد الإلكتروني</span>: {invoice.client_id.email}
          </p>
          <p style={pStyle}>
            <span style={spanStyle}>رقم الجوال</span>: {invoice.client_id.phone.replace(/\+/g, '')}+
          </p>
        </>)}



        {/* TABLE */}
        {invoice.type !== 'package' ? (
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 12,
              direction: 'rtl',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={thStyle}>م</th>
                <th style={thStyle}>اسم الدورة</th>
                <th style={thStyle}>اسم المركز</th>
                <th style={thStyle}>الكمية</th>
                <th style={thStyle}>السعر</th>
              </tr>
            </thead>
            <tbody>
              {invoice.course.map((c: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{c.name_ar}</td>
                  <td style={tdStyle}>{c.centerName}</td>
                  <td style={tdStyle}>{c.number_of_children}</td>
                  <td style={tdStyle}>
                    {c.price}
                    <img
                      src="/assets/icons/rial.png"
                      alt="Riyal"
                      style={{ width: 16, height: 16, marginLeft: 4, verticalAlign: 'middle' }}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>) : (<table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginTop: 12,
              direction: 'rtl',
            }}
          >
            <thead>
              <tr style={{ backgroundColor: '#f2f2f2' }}>
                <th style={thStyle}>م</th>
                <th style={thStyle}>اسم الباقة</th>
                <th style={thStyle}>السعر</th>
              </tr>
            </thead>
            <tbody>
              {invoice.packages.map((c: any, i: number) => (
                <tr key={i}>
                  <td style={tdStyle}>{i + 1}</td>
                  <td style={tdStyle}>{c.name_ar}</td>
                  <td style={tdStyle}>{c.price} <img
                    src="/assets/icons/rial.png"
                    alt="Riyal"
                    style={{ width: 16, height: 16, marginLeft: 4, verticalAlign: 'middle' }}
                  /></td>
                </tr>
              ))}
            </tbody>
          </table>)}

        {/* TOTAL */}
        <h3 style={{ ...h3Style, marginTop: 14, fontSize: 16, fontWeight: 700 }}>
          المبلغ الإجمالي: {invoice.total_price}{' '}
          <img
            src="/assets/icons/rial.png"
            alt="Riyal"
            style={{ width: 16, height: 16, marginLeft: 4, verticalAlign: 'middle' }}
          />
        </h3>
      </div>

      {/* FOOTER (at bottom of page) */}
      <div>
        <hr style={hrStyle} />

        <p style={{ ...pStyle, fontSize: 12 }}>
          شكرًا لتعاملكم مع مهاراتنا
        </p>

        <p style={{ ...pStyle, fontSize: 12 }}>
          ضريبة القيمة المضافة غير مطبقة، حيث إن البائع غير مسجل في ضريبة القيمة
          المضافة وفقًا للأنظمة المعمول بها في المملكة العربية السعودية.
        </p>

        <p style={{ ...pStyle, fontSize: 12 }}>
          تم إصدار هذه الفاتورة من قبل منصة مهاراتنا بصفتها منصة حجز نيابةً عن مزود
          الخدمة.
        </p>
      </div>
    </div>
  );
}
