import React, { useState, useEffect } from 'react';
import { Search, Plus, Trash2, Receipt, IndianRupee, CreditCard, Smartphone, Wallet, Download, UserPlus, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { getPatients, getTests, createInvoice, registerPatient, default as api } from '../../services/api';

const Billing = () => {
    const [patients, setPatients] = useState([]);
    const [availableTests, setAvailableTests] = useState([]);
    const [patientSearchQuery, setPatientSearchQuery] = useState('');
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [selectedTests, setSelectedTests] = useState([]);
    const [discountAmount, setDiscountAmount] = useState("");
    const [paidAmount, setPaidAmount] = useState("");
    const [paymentMode, setPaymentMode] = useState('Cash');
    const [successMessage, setSuccessMessage] = useState('');
    const [lastGeneratedInvoice, setLastGeneratedInvoice] = useState(null);
    const [isGeneratingInvoice, setIsGeneratingInvoice] = useState(false);
    const [isAddPatientModalOpen, setIsAddPatientModalOpen] = useState(false);
    const [newPatientFormData, setNewPatientFormData] = useState({
        name: '',
        age: '',
        gender: 'Male',
        mobile: '',
        referringDoctor: ''
    });
    const [formFieldErrors, setFormFieldErrors] = useState({});

    // Validation Helper (Same as PatientRegistration)
    const validateField = (name, value) => {
        let error = '';
        switch (name) {
            case 'name':
                if (value && !/^[a-zA-Z\s]+$/.test(value)) {
                    error = 'Only letters are allowed';
                }
                break;
            case 'mobile':
                if (value && !/^\d{10}$/.test(value)) {
                    error = 'Phone number must be exactly 10 digits';
                }
                break;
            case 'age':
                if (value !== '' && !/^\d+$/.test(value)) {
                    error = 'Age must be a whole number';
                }
                break;
            case 'referringDoctor':
                if (value && !/^[a-zA-Z\s\.]+$/.test(value)) {
                    error = 'Doctor name must contain only letters';
                }
                break;
            default:
                break;
        }
        return error;
    };

    const handlePatientChange = (e) => {
        let { name, value } = e.target;
        let currentError = '';

        // 1. Filter restricted characters
        if (name === 'name' || name === 'referringDoctor') {
            const allowedRegex = name === 'name' ? /[^a-zA-Z\s]/g : /[^a-zA-Z\s\.]/g;
            const filteredValue = value.replace(allowedRegex, '');
            if (filteredValue !== value) {
                currentError = name === 'name' ? 'Only letters are allowed' : 'Doctor name must contain only letters';
                value = filteredValue;
            }
        } else if (name === 'age' || name === 'mobile') {
            const filteredValue = value.replace(/\D/g, '');
            if (filteredValue !== value) {
                currentError = name === 'age' ? 'Age must be a whole number' : 'Phone number must be exactly 10 digits';
                value = filteredValue;
            }
            if (name === 'mobile' && value.length > 10) return; // Block > 10 digits
        }

        setNewPatientFormData(prev => ({ ...prev, [name]: value }));

        // 2. Validate
        const validationError = validateField(name, value);
        if (currentError && !validationError) {
            setFormFieldErrors(prev => ({ ...prev, [name]: currentError }));
        } else {
            setFormFieldErrors(prev => ({ ...prev, [name]: validationError }));
        }
    };

    useEffect(() => {
        fetchAvailableTests();

        // Load billing form data from localStorage
        const savedBillingData = localStorage.getItem('billingFormData');
        if (savedBillingData) {
            try {
                const data = JSON.parse(savedBillingData);
                if (data.selectedPatientId) {
                    // Fetch patient data if ID exists
                    getPatients({ keyword: '' }).then(({ data: patientsData }) => {
                        const patient = patientsData.patients?.find(p => p._id === data.selectedPatientId);
                        if (patient) setSelectedPatient(patient);
                    });
                }
                if (data.discount !== undefined && data.discount !== null && data.discount !== 0) {
                    setDiscountAmount(String(data.discount));
                } else {
                    setDiscountAmount("");
                }
                if (data.paidAmount !== undefined && data.paidAmount !== null && data.paidAmount !== 0) {
                    setPaidAmount(String(data.paidAmount));
                } else {
                    setPaidAmount("");
                }
                if (data.paymentMode) setPaymentMode(data.paymentMode);
                if (data.search) setPatientSearchQuery(data.search);
                if (data.newPatient) setNewPatientFormData(data.newPatient);
            } catch (err) {
                console.error('Error loading billing form data:', err);
            }
        }
    }, []);

    // Debounced Patient Search Effect
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (patientSearchQuery.length >= 2) {
                getPatients({ keyword: patientSearchQuery }).then(({ data }) => setPatients(data.patients || []));
            } else if (patientSearchQuery.length === 0) {
                setPatients([]);
            }
        }, 800);

        return () => clearTimeout(timeoutId);
    }, [patientSearchQuery]);


    const fetchAvailableTests = async () => {
        try {
            const { data } = await getTests({ limit: 1000 }); // Get all/most tests for billing
            setAvailableTests(data.tests || []);
        } catch (err) {
            console.error('Failed to fetch tests:', err);
            toast.error('Failed to load tests');
        }
    };

    // Restore selected tests when tests are loaded (only on initial load)
    const [hasTestsRestored, setHasTestsRestored] = useState(false);
    useEffect(() => {
        if (availableTests.length > 0 && !hasTestsRestored) {
            const savedBillingData = localStorage.getItem('billingFormData');
            if (savedBillingData) {
                try {
                    const formData = JSON.parse(savedBillingData);
                    if (formData.selectedTestIds && formData.selectedTestIds.length > 0) {
                        const restoredTests = formData.selectedTestIds
                            .map(testId => availableTests.find(test => test._id === testId))
                            .filter(Boolean);
                        if (restoredTests.length > 0) {
                            setSelectedTests(restoredTests);
                        }
                    }
                    setHasTestsRestored(true);
                } catch (err) {
                    console.error('Error restoring tests:', err);
                    setHasTestsRestored(true);
                }
            } else {
                setHasTestsRestored(true);
            }
        }
    }, [availableTests.length, hasTestsRestored]);

    const handleSearchPatients = async (e) => {
        e.preventDefault();
        try {
            const { data } = await getPatients({ keyword: patientSearchQuery });
            setPatients(data.patients || []);
        } catch (err) {
            console.error('Failed to search patients:', err);
            toast.error('Failed to search patients');
        }
    };

    const handleAddTestToInvoice = (testId) => {
        const testToAdd = availableTests.find(test => test._id === testId);
        if (testToAdd && !selectedTests.find(test => test._id === testId)) {
            setSelectedTests(prevTests => [...prevTests, testToAdd]);
        }
    };

    const handleRemoveTestFromInvoice = (testIndex) => {
        setSelectedTests(prevTests => prevTests.filter((_, index) => index !== testIndex));
    };

    // Save billing form data to localStorage whenever it changes
    useEffect(() => {
        const billingFormData = {
            selectedPatientId: selectedPatient?._id || null,
            selectedTestIds: selectedTests.map(test => test._id),
            discount: discountAmount === "" ? 0 : (Number(discountAmount) || 0),
            paidAmount: paidAmount === "" ? 0 : (Number(paidAmount) || 0),
            paymentMode,
            search: patientSearchQuery,
            newPatient: newPatientFormData
        };
        localStorage.setItem('billingFormData', JSON.stringify(billingFormData));
    }, [selectedPatient, selectedTests, discountAmount, paidAmount, paymentMode, patientSearchQuery, newPatientFormData]);

    // Calculate billing amounts
    const subtotalAmount = selectedTests.reduce((total, test) => total + test.price, 0);
    const discountValue = discountAmount === "" || discountAmount === null ? 0 : Number(discountAmount) || 0;
    const paidAmountValue = paidAmount === "" || paidAmount === null ? 0 : Number(paidAmount) || 0;
    const totalAmount = subtotalAmount - discountValue;
    const balanceAmount = Math.max(0, totalAmount - paidAmountValue);

    const handleGenerateInvoice = async () => {
        if (!selectedPatient) {
            toast.error('Please select a patient');
            return;
        }
        if (selectedTests.length === 0) {
            toast.error('Please select at least one test');
            return;
        }

        setIsGeneratingInvoice(true);
        try {
            const invoicePayload = {
                patientId: selectedPatient._id,
                tests: selectedTests.map(test => test._id),
                discount: discountValue,
                paidAmount: paidAmountValue,
                paymentMode
            };
            const { data } = await createInvoice(invoicePayload);
            setSuccessMessage(`Invoice Generated Successfully! Invoice ID: ${data.invoiceIds}`);
            setLastGeneratedInvoice(data);

            // Clear form and localStorage
            setSelectedPatient(null);
            setSelectedTests([]);
            setDiscountAmount("");
            setPaidAmount("");
            setPatientSearchQuery('');
            setNewPatientFormData({
                name: '',
                age: '',
                gender: 'Male',
                mobile: '',
                referringDoctor: ''
            });
            setHasTestsRestored(false);
            // Clear billing form data from localStorage
            localStorage.removeItem('billingFormData');

            // Scroll to top to show success message
            window.scrollTo({ top: 0, behavior: 'smooth' });

            setTimeout(() => {
                setSuccessMessage('');
                setLastGeneratedInvoice(null);
            }, 30000); // Longer visibility
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to generate invoice');
        } finally {
            setIsGeneratingInvoice(false);
        }
    };

    const handleDownloadInvoiceAsPDF = async (invoice) => {
        try {
            // Use invoiceIds (human-readable ID) instead of MongoDB _id
            const invoiceId = invoice?.invoiceIds || invoice?._id;
            if (!invoiceId) {
                throw new Error('Invoice ID not found');
            }

            const apiUrl = `/billing/print/${invoiceId}`;
            console.log('Download API URL:', apiUrl, 'Invoice ID:', invoiceId);
            const response = await api.get(apiUrl, {
                responseType: 'text',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            // Check if response is HTML
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                // Create a visible window to show the invoice
                const printWindow = window.open('', '_blank', 'width=800,height=900');
                if (!printWindow) {
                    throw new Error('Please allow popups to view invoices');
                }

                // Wait for window to be fully ready (not about:blank)
                await new Promise((resolve) => {
                    const checkReady = () => {
                        try {
                            if (printWindow.document && printWindow.document.readyState !== 'loading') {
                                resolve();
                            } else {
                                setTimeout(checkReady, 50);
                            }
                        } catch (e) {
                            setTimeout(checkReady, 50);
                        }
                    };
                    checkReady();
                });

                // Add download button to the invoice HTML
                let invoiceHTML = response.data;

                // Inject download button before closing body tag
                const downloadButtonHTML = `
                    <div style="text-align: center; margin: 20px 0; padding: 20px;">
                        <button id="downloadInvoiceBtn" style="
                            background: #2563eb;
                            color: white;
                            border: none;
                            padding: 12px 30px;
                            font-size: 16px;
                            font-weight: bold;
                            border-radius: 8px;
                            cursor: pointer;
                            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                            transition: all 0.3s;
                        " onmouseover="this.style.background='#1d4ed8'" onmouseout="this.style.background='#2563eb'">
                            📥 Download Document
                        </button>
                    </div>
                    <script>
                        (function() {
                            const invoiceData = ${JSON.stringify({ invoiceId, invoiceIds: invoice.invoiceIds })};
                            
                            document.getElementById('downloadInvoiceBtn').addEventListener('click', async function() {
                                const btn = this;
                                btn.disabled = true;
                                btn.textContent = '⏳ Generating PDF...';
                                btn.style.background = '#6b7280';
                                
                                try {
                                    // Import html2pdf
                                    const script = document.createElement('script');
                                    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
                                    document.head.appendChild(script);
                                    
                                    await new Promise((resolve) => {
                                        script.onload = resolve;
                                        setTimeout(resolve, 2000);
                                    });
                                    
                                    // Get the invoice container - exactly what's visible on the page
                                    const invoiceContainer = document.querySelector('.invoice-container');
                                    if (!invoiceContainer) {
                                        throw new Error('Invoice container not found');
                                    }
                                    
                                    // Ensure container is visible and properly styled
                                    invoiceContainer.style.display = 'block';
                                    invoiceContainer.style.visibility = 'visible';
                                    invoiceContainer.style.opacity = '1';
                                    invoiceContainer.style.position = 'relative';
                                    
                                    // Wait for all images to load completely
                                    const images = invoiceContainer.querySelectorAll('img');
                                    await Promise.all(Array.from(images).map(img => {
                                        if (img.complete && img.naturalHeight !== 0) {
                                            return Promise.resolve();
                                        }
                                        return new Promise(resolve => {
                                            const timeout = setTimeout(resolve, 5000);
                                            img.onload = () => { clearTimeout(timeout); resolve(); };
                                            img.onerror = () => { clearTimeout(timeout); resolve(); };
                                        });
                                    }));
                                    
                                    // Wait for all content to render
                                    await new Promise(resolve => {
                                        requestAnimationFrame(() => {
                                            requestAnimationFrame(() => {
                                                setTimeout(resolve, 1000);
                                            });
                                        });
                                    });
                                    
                                    // Get actual dimensions of the content
                                    const containerWidth = invoiceContainer.offsetWidth || invoiceContainer.scrollWidth || 794;
                                    const containerHeight = invoiceContainer.offsetHeight || invoiceContainer.scrollHeight || 1123;
                                    
                                    const opt = {
                                        margin: [5, 5, 5, 5],
                                        filename: 'invoice-' + invoiceData.invoiceIds + '.pdf',
                                        image: { 
                                            type: 'jpeg', 
                                            quality: 0.98 
                                        },
                                        html2canvas: { 
                                            scale: 2,
                                            useCORS: true,
                                            logging: false,
                                            backgroundColor: '#ffffff',
                                            width: containerWidth,
                                            height: containerHeight,
                                            windowWidth: window.innerWidth,
                                            windowHeight: window.innerHeight,
                                            allowTaint: true,
                                            letterRendering: true,
                                            removeContainer: false,
                                            x: 0,
                                            y: 0,
                                            scrollX: 0,
                                            scrollY: 0,
                                            onclone: (clonedDoc, element) => {
                                                // Preserve all styles exactly as they appear
                                                const clonedContainer = clonedDoc.querySelector('.invoice-container');
                                                if (clonedContainer) {
                                                    // Ensure all styles are preserved
                                                    clonedContainer.style.display = 'block';
                                                    clonedContainer.style.visibility = 'visible';
                                                    clonedContainer.style.opacity = '1';
                                                    clonedContainer.style.position = 'relative';
                                                    clonedContainer.style.background = '#ffffff';
                                                    
                                                    // Make sure all child elements are visible
                                                    const allElements = clonedContainer.querySelectorAll('*');
                                                    allElements.forEach(el => {
                                                        const computedStyle = window.getComputedStyle(el);
                                                        if (computedStyle.display === 'none') {
                                                            el.style.display = 'block';
                                                        }
                                                        if (computedStyle.visibility === 'hidden') {
                                                            el.style.visibility = 'visible';
                                                        }
                                                        if (computedStyle.opacity === '0') {
                                                            el.style.opacity = '1';
                                                        }
                                                    });
                                                }
                                            }
                                        },
                                        jsPDF: { 
                                            unit: 'mm', 
                                            format: 'a4', 
                                            orientation: 'portrait',
                                            compress: true
                                        },
                                        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                                    };
                                    
                                    // Generate PDF from the exact visible content
                                    await html2pdf().set(opt).from(invoiceContainer).save();
                                    
                                    btn.textContent = '✅ Downloaded!';
                                    btn.style.background = '#10b981';
                                    setTimeout(() => {
                                        btn.disabled = false;
                                        btn.textContent = '📥 Download Document';
                                        btn.style.background = '#2563eb';
                                    }, 2000);
                                } catch (error) {
                                    console.error('Download error:', error);
                                    btn.textContent = '❌ Error - Try Again';
                                    btn.style.background = '#ef4444';
                                    btn.disabled = false;
                                    alert('Failed to download PDF: ' + error.message);
                                }
                            });
                        })();
                    </script>
                `;

                // Insert button before closing body tag
                invoiceHTML = invoiceHTML.replace('</body>', downloadButtonHTML + '</body>');

                // Write the invoice HTML with download button
                printWindow.document.open();
                printWindow.document.write(invoiceHTML);
                printWindow.document.close();

                // Wait for window content to fully load
                await new Promise((resolve) => {
                    const checkContent = () => {
                        try {
                            if (printWindow.document.readyState === 'complete') {
                                const container = printWindow.document.querySelector('.invoice-container');
                                const downloadBtn = printWindow.document.getElementById('downloadInvoiceBtn');
                                if (container && downloadBtn) {
                                    setTimeout(resolve, 500);
                                } else {
                                    setTimeout(checkContent, 100);
                                }
                            } else {
                                setTimeout(checkContent, 100);
                            }
                        } catch (e) {
                            setTimeout(checkContent, 100);
                        }
                    };
                    setTimeout(() => resolve(), 3000);
                    checkContent();
                });

                toast.success('Invoice opened. Click "Download Document" button to download PDF.');
            } else {
                throw new Error('Invalid response format. Expected HTML.');
            }
        } catch (err) {
            console.error('Download error:', err);
            toast.error(err.message || 'Failed to open invoice');
        }
    };

    const handlePrintInvoiceDocument = async (invoice) => {
        console.log('Printing Invoice:', invoice);
        const printWindow = window.open('', '_blank');
        if (!printWindow) return toast.error('Please allow popups to print invoices');

        printWindow.document.write('<html><head><title>Generating Invoice...</title></head><body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;"><div style="text-align:center;"><h2>Generating Invoice...</h2><p>Please wait a moment.</p></div></body></html>');

        try {
            // Use invoiceIds (human-readable ID) instead of MongoDB _id
            const invoiceId = invoice?.invoiceIds || invoice?._id;
            if (!invoiceId) {
                throw new Error('Invoice ID not found');
            }

            const apiUrl = `/billing/print/${invoiceId}`;
            console.log('Print API URL:', apiUrl, 'Invoice ID:', invoiceId);
            const response = await api.get(apiUrl, {
                responseType: 'text',
                headers: {
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
                }
            });

            // Check if response is HTML
            if (typeof response.data === 'string' && response.data.includes('<!DOCTYPE html>')) {
                printWindow.document.open();
                printWindow.document.write(response.data);
                printWindow.document.close();

                // Wait for window content to fully load (same as download)
                await new Promise((resolve) => {
                    if (printWindow.document.readyState === 'complete') {
                        setTimeout(resolve, 500);
                    } else {
                        printWindow.onload = () => setTimeout(resolve, 500);
                        setTimeout(resolve, 2000); // Fallback timeout
                    }
                });

                // Wait for all images to load (same as download)
                const images = printWindow.document.querySelectorAll('img');
                const imagePromises = Array.from(images).map(img => {
                    if (img.complete && img.naturalHeight !== 0) {
                        return Promise.resolve();
                    }
                    return new Promise((resolve) => {
                        const timeout = setTimeout(() => resolve(), 3000);
                        img.onload = () => {
                            clearTimeout(timeout);
                            resolve();
                        };
                        img.onerror = () => {
                            clearTimeout(timeout);
                            resolve(); // Continue even if image fails
                        };
                    });
                });

                await Promise.all(imagePromises);

                // Additional wait to ensure all content is fully rendered (same as download)
                await new Promise(resolve => setTimeout(resolve, 500));

                // Auto print after content loads
                printWindow.print();
            } else {
                throw new Error('Invalid response format. Expected HTML but received: ' + typeof response.data);
            }
        } catch (err) {
            printWindow.close();
            console.error('Print error:', err);
            toast.error(err.message || 'Failed to open print window');
        }
    };

    const handleRegisterNewPatient = async (e) => {
        e.preventDefault();

        // Final Validation
        const errors = {};
        Object.keys(newPatientFormData).forEach(key => {
            const error = validateField(key, newPatientFormData[key]);
            if (error) errors[key] = error;
        });

        if (Object.keys(errors).length > 0) {
            setFormFieldErrors(errors);
            toast.error(errors[Object.keys(errors)[0]]);
            return;
        }

        try {
            // Format age securely
            const patientData = { ...newPatientFormData };
            if (patientData.age) {
                patientData.age = `${patientData.age} Years`;
            }

            const { data } = await registerPatient(patientData);
            setSelectedPatient(data);
            setIsAddPatientModalOpen(false);
            setNewPatientFormData({ name: '', age: '', gender: 'Male', mobile: '', referringDoctor: '' });
            setFormFieldErrors({});
            toast.success('Patient registered successfully!');
        } catch (err) {
            console.error('Failed to register patient:', err);
            if (err.response?.status === 400 && err.response?.data?.patient) {
                toast.error(err.response.data.message);
                setSelectedPatient(err.response.data.patient);
                setIsAddPatientModalOpen(false);
            } else {
                toast.error(err.response?.data?.message || 'Failed to register patient');
            }
        }
    };


    return (
        <div className="max-w-[1600px] mx-auto p-6 min-h-[calc(100vh-64px)]">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <Receipt className="w-8 h-8 text-primary-600" />
                        New Invoice
                    </h1>
                    <p className="text-gray-500 mt-1 text-sm font-medium">Create new bills, manage patients, and record payments.</p>
                </div>
                {lastGeneratedInvoice && successMessage && (
                    <div className="fixed inset-0 z-[100] bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
                        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
                            <div className="p-8 flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6 animate-bounce-in">
                                    <Receipt className="w-10 h-10 text-green-600" />
                                </div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">Invoice Generated!</h2>
                                <p className="text-gray-500 mb-8">
                                    The invoice has been successfully created and saved to the system.
                                </p>

                                <div className="grid grid-cols-2 gap-4 w-full mb-4">
                                    <button
                                        onClick={() => handlePrintInvoiceDocument(lastGeneratedInvoice)}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-blue-50 text-blue-700 rounded-2xl border-2 border-blue-100 hover:bg-blue-100 hover:border-blue-200 transition-all group"
                                    >
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                            <Receipt className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-sm">Print Invoice</span>
                                    </button>

                                    <button
                                        onClick={() => handleDownloadInvoiceAsPDF(lastGeneratedInvoice)}
                                        className="flex flex-col items-center justify-center gap-2 p-4 bg-purple-50 text-purple-700 rounded-2xl border-2 border-purple-100 hover:bg-purple-100 hover:border-purple-200 transition-all group"
                                    >
                                        <div className="p-2 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                                            <Download className="w-6 h-6" />
                                        </div>
                                        <span className="font-bold text-sm">Download PDF</span>
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        setSuccessMessage('');
                                        setLastGeneratedInvoice(null);
                                    }}
                                    className="text-gray-400 font-medium hover:text-gray-600 transition-colors text-sm"
                                >
                                    Close & Create New Invoice
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-12 gap-6 h-[calc(100vh-180px)]">
                {/* LEFT COLUMN: Patient Selection (3 cols) */}
                <div className="col-span-12 lg:col-span-3 flex flex-col gap-4 h-full">
                    {/* Search Card */}
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <UserPlus className="w-4 h-4" /> Patient Details
                            </h3>
                            <button
                                onClick={() => setIsAddPatientModalOpen(true)}
                                className="text-[10px] font-bold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-lg hover:bg-primary-100 transition-colors uppercase tracking-wider"
                            >
                                + New Patient
                            </button>
                        </div>

                        {!selectedPatient ? (
                            <div className="relative group">
                                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search Name / Mobile / ID..."
                                    className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-semibold focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all placeholder:text-gray-400"
                                    value={patientSearchQuery}
                                    onChange={e => setPatientSearchQuery(e.target.value)}
                                    autoFocus
                                />

                                {/* Search Results Dropdown */}
                                {(patientSearchQuery.length > 0 || patients.length > 0) && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-100 rounded-xl shadow-xl z-20 max-h-[400px] overflow-y-auto custom-scrollbar">
                                        {patients.length > 0 ? (
                                            patients.map(p => (
                                                <button
                                                    key={p._id}
                                                    onClick={() => { setSelectedPatient(p); setPatients([]); setPatientSearchQuery(''); }}
                                                    className="w-full text-left p-3 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors flex items-center justify-between group/item"
                                                >
                                                    <div>
                                                        <p className="font-bold text-gray-900 text-sm group-hover/item:text-primary-600 transition-colors">{p.name}</p>
                                                        <p className="text-xs text-gray-400 font-medium">{p.mobile}</p>
                                                    </div>
                                                    <span className="text-[10px] font-bold bg-gray-100 text-gray-500 px-2 py-1 rounded-lg group-hover/item:bg-white group-hover/item:shadow-sm">
                                                        {p.age} / {p.gender?.[0]}
                                                    </span>
                                                </button>
                                            ))
                                        ) : (
                                            patientSearchQuery.length >= 2 && <div className="p-4 text-center text-xs font-bold text-gray-400">No patients found</div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ) : (
                            // Selected Patient Card
                            <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-xl p-4 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setSelectedPatient(null)} className="p-1.5 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50">
                                        <X className="w-3.5 h-3.5" />
                                    </button>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-12 h-12 rounded-full bg-white border-2 border-primary-100 flex items-center justify-center text-xl shadow-sm">
                                        {selectedPatient.gender === 'Female' ? '👩' : '👨'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold text-gray-900 truncate pr-6">{selectedPatient.name}</h4>
                                        <div className="mt-1 space-y-0.5">
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span> {selectedPatient.age} / {selectedPatient.gender}
                                            </p>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                                                <span className="w-1 h-1 rounded-full bg-gray-300"></span> {selectedPatient.mobile}
                                            </p>
                                            <p className="text-[10px] text-primary-600 font-bold mt-2 uppercase tracking-wide">
                                                ID: {selectedPatient.patientId}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {selectedPatient.referringDoctor && (
                                    <div className="mt-4 pt-3 border-t border-primary-100/50">
                                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Referred By</p>
                                        <p className="text-xs font-semibold text-gray-700 flex items-center gap-1">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                            Dr. {selectedPatient.referringDoctor}
                                        </p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Placeholder illustration for empty space */}
                    <div className="flex-1 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200 flex flex-col items-center justify-center p-6 text-center">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Receipt className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-sm font-bold text-gray-400">Ready for billing</p>
                        <p className="text-xs text-gray-300 mt-1">Select a patient to start</p>
                    </div>
                </div>

                {/* MIDDLE COLUMN: Test Selection (5 cols) */}
                <div className="col-span-12 lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm flex flex-col h-full overflow-hidden">
                    <div className="p-5 border-b border-gray-50 flex items-center justify-between bg-gray-50/30">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            Test Selection
                        </h3>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold bg-gray-100 px-2 py-1 rounded-md text-gray-500">{selectedTests.length} Items</span>
                        </div>
                    </div>

                    <div className="p-4 border-b border-gray-50">
                        <div className="relative group">
                            <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                            <select
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all appearance-none cursor-pointer hover:bg-white"
                                onChange={(e) => handleAddTestToInvoice(e.target.value)}
                                value=""
                            >
                                <option value="">Start typing or select a test...</option>
                                {availableTests.map(test => (
                                    <option key={test._id} value={test._id}>{test.testName} - ₹{test.price}</option>
                                ))}
                            </select>
                            <div className="absolute right-4 top-3.5 pointer-events-none">
                                <Plus className="w-4 h-4 text-gray-400" />
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                        {selectedTests.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 gap-3">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 flex items-center justify-center">
                                    <Plus className="w-6 h-6 text-gray-300" />
                                </div>
                                <p className="text-xs font-medium">No tests selected yet</p>
                            </div>
                        ) : (
                            selectedTests.map((t, index) => (
                                <div key={index} className="group flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-100 transition-all animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm leading-tight">{t.testName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-0.5">{t.department?.name || 'General'}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <span className="font-bold text-gray-900 text-sm">₹{t.price}</span>
                                        <button
                                            onClick={() => handleRemoveTestFromInvoice(index)}
                                            className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {selectedTests.length > 0 && (
                        <div className="p-4 bg-gray-50 border-t border-gray-100">
                            <div className="flex justify-between items-center text-sm">
                                <span className="font-medium text-gray-500">Subtotal</span>
                                <span className="font-bold text-gray-900">₹{subtotalAmount}</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* RIGHT COLUMN: Payment & Actions (4 cols) */}
                <div className="col-span-12 lg:col-span-4 flex flex-col gap-4 h-full">
                    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex-1 flex flex-col">
                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 flex items-center gap-2">
                            Payment Details
                        </h3>

                        <div className="space-y-6 flex-1">
                            {/* Summary Cards */}
                            <div className="space-y-3">
                                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                                    <span className="text-sm font-medium text-gray-600">Total Bill Amount</span>
                                    <span className="text-lg font-bold text-gray-900">₹{subtotalAmount}</span>
                                </div>

                                <div className="flex items-center justify-between p-1">
                                    <span className="text-sm font-medium text-gray-500 flex items-center gap-2">
                                        Discount
                                        <span className="text-[10px] bg-yellow-50 text-yellow-700 px-1.5 py-0.5 rounded border border-yellow-100 uppercase font-bold">Optional</span>
                                    </span>
                                    <div className="flex items-center gap-2 w-32">
                                        <span className="text-gray-400 text-sm font-bold">- ₹</span>
                                        <input
                                            type="number"
                                            value={discountAmount}
                                            onChange={e => setDiscountAmount(e.target.value)}
                                            className="w-full text-right font-bold text-gray-900 border-b-2 border-gray-100 focus:border-primary-500 outline-none transition-colors bg-transparent p-1"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>

                                <div className="h-[1px] bg-gray-100 my-4"></div>

                                <div className="flex items-center justify-between">
                                    <span className="text-lg font-bold text-gray-900">Grand Total</span>
                                    <span className="text-2xl font-black text-primary-600">₹{totalAmount}</span>
                                </div>
                            </div>

                            {/* Paid & Balance */}
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm font-bold text-blue-900">Paid Amount</span>
                                    <div className="flex items-center gap-2 w-32 bg-white rounded-lg px-3 py-1.5 border border-blue-100 focus-within:ring-2 ring-blue-500/20 transition-all">
                                        <span className="text-gray-400 text-sm font-bold">₹</span>
                                        <input
                                            type="number"
                                            value={paidAmount}
                                            onChange={e => setPaidAmount(e.target.value)}
                                            className="w-full text-right font-bold text-gray-900 outline-none bg-transparent"
                                            placeholder="0"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-blue-100/50">
                                    <span className="text-sm font-bold text-gray-500">Balance Due</span>
                                    <span className={`text-lg font-bold ${balanceAmount > 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                        ₹{balanceAmount}
                                    </span>
                                </div>
                            </div>

                            {/* Payment Mode */}
                            <div>
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 block">Payment Mode</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {[
                                        { value: 'Cash', icon: Wallet },
                                        { value: 'UPI', icon: Smartphone },
                                        { value: 'Card', icon: CreditCard }
                                    ].map(mode => {
                                        const Icon = mode.icon;
                                        const active = paymentMode === mode.value;
                                        return (
                                            <button
                                                key={mode.value}
                                                onClick={() => setPaymentMode(mode.value)}
                                                className={`flex flex-col items-center justify-center gap-2 p-3 rounded-xl border transition-all ${active
                                                    ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <Icon className={`w-5 h-5 ${active ? 'text-white' : 'text-gray-400'}`} />
                                                <span className="text-xs font-bold">{mode.value}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="mt-6 pt-6 border-t border-gray-100">
                            <button
                                onClick={handleGenerateInvoice}
                                disabled={isGeneratingInvoice || !selectedPatient || selectedTests.length === 0}
                                className="w-full py-4 bg-gradient-to-r from-primary-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-xl shadow-primary-500/30 hover:shadow-primary-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2.5"
                            >
                                {isGeneratingInvoice ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Receipt className="w-5 h-5" />
                                        <span>Generate Bill & Print</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Add Patient Modal */}
            {isAddPatientModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-primary-600 text-white">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                                    <UserPlus className="w-6 h-6 text-white" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold">New Patient</h3>
                                    <p className="text-xs text-primary-100 font-medium">Quick Registration</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsAddPatientModalOpen(false)}
                                className="p-2 hover:bg-white/20 rounded-lg transition-colors text-white/80 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Modal Body */}
                        <form onSubmit={handleRegisterNewPatient} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Full Name *</label>
                                    <input
                                        required
                                        name="name"
                                        className={`w-full px-5 py-3 border rounded-xl font-medium focus:ring-4 outline-none transition-all ${formFieldErrors.name
                                            ? 'border-red-300 focus:ring-red-100 bg-red-50/30'
                                            : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-primary-100'
                                            }`}
                                        value={newPatientFormData.name}
                                        onChange={handlePatientChange}
                                        placeholder="Enter full name"
                                    />
                                    {formFieldErrors.name && <p className="mt-1 text-xs font-bold text-red-500 ml-1">{formFieldErrors.name}</p>}
                                </div>

                                <div className="grid grid-cols-2 gap-5">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Mobile *</label>
                                        <input
                                            required
                                            name="mobile"
                                            className={`w-full px-5 py-3 border rounded-xl font-medium focus:ring-4 outline-none transition-all ${formFieldErrors.mobile
                                                ? 'border-red-300 focus:ring-red-100 bg-red-50/30'
                                                : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-primary-100'
                                                }`}
                                            value={newPatientFormData.mobile}
                                            onChange={handlePatientChange}
                                            placeholder="10-digit number"
                                        />
                                        {formFieldErrors.mobile && <p className="mt-1 text-xs font-bold text-red-500 ml-1">{formFieldErrors.mobile}</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Age *</label>
                                        <input
                                            required
                                            type="number"
                                            name="age"
                                            min="0"
                                            onKeyDown={(e) => ['e', 'E', '.', '-', '+'].includes(e.key) && e.preventDefault()}
                                            className={`w-full px-5 py-3 border rounded-xl font-medium focus:ring-4 outline-none transition-all ${formFieldErrors.age
                                                ? 'border-red-300 focus:ring-red-100 bg-red-50/30'
                                                : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-primary-100'
                                                }`}
                                            value={newPatientFormData.age}
                                            onChange={handlePatientChange}
                                            placeholder="Years"
                                        />
                                        {formFieldErrors.age && <p className="mt-1 text-xs font-bold text-red-500 ml-1">{formFieldErrors.age}</p>}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Gender *</label>
                                    <div className="flex gap-3">
                                        {['Male', 'Female', 'Other'].map(g => (
                                            <button
                                                key={g}
                                                type="button"
                                                onClick={() => setNewPatientFormData(prev => ({ ...prev, gender: g }))}
                                                className={`flex-1 py-2.5 rounded-xl border font-bold text-sm transition-all ${newPatientFormData.gender === g
                                                    ? 'border-primary-600 bg-primary-600 text-white shadow-lg shadow-primary-500/30'
                                                    : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'}`}
                                            >
                                                {g}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 ml-1">Referring Doctor (Optional)</label>
                                <input
                                    name="referringDoctor"
                                    className={`w-full px-5 py-3 border rounded-xl font-medium focus:ring-4 outline-none transition-all ${formFieldErrors.referringDoctor
                                        ? 'border-red-300 focus:ring-red-100 bg-red-50/30'
                                        : 'border-gray-200 bg-gray-50 focus:bg-white focus:border-primary-400 focus:ring-primary-100'
                                        }`}
                                    value={newPatientFormData.referringDoctor}
                                    onChange={handlePatientChange}
                                    placeholder="Doctor Name"
                                />
                                {formFieldErrors.referringDoctor && <p className="mt-1 text-xs font-bold text-red-500 ml-1">{formFieldErrors.referringDoctor}</p>}
                            </div>

                            <div className="pt-2 border-t border-gray-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsAddPatientModalOpen(false)}
                                    className="flex-1 px-4 py-3.5 border border-gray-200 text-gray-600 rounded-xl font-bold text-sm hover:bg-gray-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-4 py-3.5 bg-primary-600 text-white rounded-xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/30"
                                >
                                    Register Patient
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Billing;
