'use client';

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import axiosInstance from "src/utils/axios";
import html2pdf from 'html2pdf.js';
import InvoiceHidden from "src/sections/main/invoices/invoice-hidden";




const InvoicePdf = () => {

    const { id } = useParams();

    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
    const [shouldDownload, setShouldDownload] = useState(false);
    useEffect(() => {
        const fetchPdf = async () => {
            const res = await axiosInstance.get(`/client/download-invoice-parent/${id}`);
            const invoice = res?.data;
            setSelectedInvoice(invoice);
        }

        fetchPdf();

        if (!shouldDownload || !selectedInvoice) return;

        const element = document.getElementById('invoice-pdf');
        if (!element) return;

        html2pdf()
            .set({
                margin: 1,
                filename: `invoice-${selectedInvoice._id}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: {
                    scale: 1,
                    windowWidth: 780,
                    useCORS: true,
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait',
                },
            })
            .from(element)
            .outputPdf('bloburl')
            .then((pdfUrl) => {
                window.open(pdfUrl, '_blank'); // 👀 preview

                // cleanup
                setShouldDownload(false);
                setSelectedInvoice(null);
            });
    }, [id, selectedInvoice, shouldDownload]);
    return (
        <div>
            <InvoiceHidden invoice={selectedInvoice} />
        </div>
    )
}

export default InvoicePdf;