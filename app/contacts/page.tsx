// app/contacts/page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"

// Force dynamic rendering to prevent build-time errors with authentication
export const dynamic = 'force-dynamic'
import { ShoppingCart, Contact } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/supabase-client.js"

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

const getCleanValue = (value: string | number) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[$,%]/g, '')) || 0;
    }
    return 0;
};

const calculateItem = (retail: number, insAllow: number, discount: number, copay: number, isCopayOnly = false) => {
    let finalCost, yourCost, insSvgs;
    if (isCopayOnly) {
        finalCost = copay;
        yourCost = 0;
        insSvgs = retail - finalCost;
    } else {
        yourCost = retail * (1 - (discount / 100)) - insAllow;
        yourCost = Math.max(0, yourCost);
        finalCost = yourCost + copay;
        insSvgs = retail - finalCost;
    }
    return { yourCost, finalCost, insSvgs };
};

export default function ContactsPage() {
    const [customerName, setCustomerName] = useState("")
    const [insuranceType, setInsuranceType] = useState("other")
    const [selectedLensId, setSelectedLensId] = useState<string | undefined>(undefined);
    const [visionBenefit, setVisionBenefit] = useState("");
    const [wearerType, setWearerType] = useState('new');
    const [selectedSupply, setSelectedSupply] = useState<string | undefined>(undefined);
    const [customerApproved, setCustomerApproved] = useState(false);

    const [contactLensDatabase, setContactLensDatabase] = useState<any[]>([]);
    const [examListData, setExamListData] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [selectedStore, setSelectedStore] = useState<any>(null);

    const [examSelections, setExamSelections] = useState<any>({});
    
    const examCategories = [
        { id: 'eye-exam', label: 'Eye Exam', dbCategory: 'Eye Exam', type: 'select' },
        { id: 'contacts-exam', label: 'Contacts Exam', dbCategory: 'Contacts Exam', type: 'select'},
        { id: 'refraction', label: 'Refraction', dbCategory: 'Refraction', type: 'checkbox' },
        { id: 'retinal-fundus-photos', label: 'Retinal Fundus Photos', dbCategory: 'Retinal Fundus Photos', type: 'checkbox' }
    ];

    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const storeData = sessionStorage.getItem('selectedStore');
            if (!storeData) { window.location.href = '/select-store'; return; }
            setSelectedStore(JSON.parse(storeData));

            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { window.location.href = '/'; return; }

            const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
            setUser({ ...user, ...profile });

            const contactsPromise = supabase.from('contacts').select('*');
            const examsPromise = supabase.from('exams').select('*').eq('is_active', true);
            const [contactsResult, examsResult] = await Promise.all([contactsPromise, examsPromise]);

            if (contactsResult.data) setContactLensDatabase(contactsResult.data);
            if (examsResult.data) setExamListData([{ "exam_type": "None", "Category": "All", "price_retail": 0 }, ...examsResult.data]);
        };
        checkUserAndFetchData();
    }, []);
    
    const handleExamInputChange = (category: string, field: string, value: any) => {
        setExamSelections((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const examTotal = useMemo(() => {
        let total = 0;
        examCategories.forEach(cat => {
            const selection = examSelections[cat.id] || {};
            const selectedValue = selection.value;
            if (!selectedValue || selectedValue === "None") return;
            
            const selectedItem = examListData.find(p => p.exam_type === selectedValue);
            if (!selectedItem) return;

            const { finalCost } = calculateItem(
                selectedItem.price_retail,
                getCleanValue(selection.allowance),
                getCleanValue(selection.discount),
                getCleanValue(selection.copay),
                !selection.allowance && !selection.discount && !!selection.copay
            );
            total += finalCost;
        });
        return total;
    }, [examSelections, examListData]);

    const summary = useMemo(() => {
        const lens = contactLensDatabase.find((l) => l.id.toString() === selectedLensId);
        if (!lens) return null;

        const benefit = getCleanValue(visionBenefit);
        const taxRate = 0.06;
        const storeDiscountPercent = 0.05;

        const supplies = {
          '3m': { boxes: lens.number_of_contacts_three_months, months: 3, label: "3 Month", rebate: wearerType === 'new' ? lens.new_wearer_rebate_three : lens.old_wearer_rebate_three },
          '6m': { boxes: lens.number_of_contacts_six_months, months: 6, label: "6 Month", rebate: wearerType === 'new' ? lens.new_wearer_rebate_six : lens.old_wearer_rebate_six },
          annual: { boxes: lens.number_of_contacts_one_year, months: 12, label: "Annual", rebate: wearerType === 'new' ? lens.new_wearer_rebate_annual : lens.old_wearer_rebate_annual },
        };

        const results: Record<string, any> = {};

        for (const [key, value] of Object.entries(supplies)) {
            const totalCost = lens.price * value.boxes;
            const rebate = value.rebate || 0;
            const storeDiscount = key === "annual" ? Math.max(0, totalCost - benefit - rebate) * storeDiscountPercent : 0;
            const subtotal = totalCost - benefit - rebate - storeDiscount;
            const tax = subtotal > 0 ? subtotal * taxRate : 0;
            const finalCost = subtotal + tax + examTotal;

            results[key] = {
                ...value,
                totalCost, benefit, rebate, storeDiscount, tax, finalCost,
                costPerBox: value.boxes > 0 ? (totalCost - benefit - rebate - storeDiscount) / value.boxes : 0
            };
        }
        return { lens, results };
    }, [selectedLensId, visionBenefit, examTotal, wearerType, contactLensDatabase]);

    const resetCalculator = () => {
        setCustomerName("");
        setInsuranceType("other");
        setExamSelections({});
        setSelectedLensId(undefined);
        setVisionBenefit("");
        setWearerType("new");
        setSelectedSupply(undefined);
        setCustomerApproved(false);
    };
    
    const saveQuote = async () => {
        if (!customerName) { alert("Please enter a customer name."); return; }
        if (!selectedSupply) { alert("Please select a supply option."); return; }
        if (!customerApproved) { alert("Please have the customer approve the quote."); return; }

        const lens = contactLensDatabase.find(l => l.id.toString() === selectedLensId);
        if (!lens || !summary) { alert("Please select a contact lens."); return; }

        const supplyData = summary.results[selectedSupply];
        const { totalExamRetail } = examCategories.reduce((acc, cat) => {
            const selection = examSelections[cat.id] || {};
            const selectedItem = examListData.find(p => p.exam_type === selection.value);
            if (selectedItem) acc.totalExamRetail += selectedItem.price_retail;
            return acc;
        }, {totalExamRetail: 0});
        
        const saleData = {
            optician_id: user.id,
            store_id: selectedStore.id,
            customer_name: customerName,
            final_cost: supplyData.finalCost,
            total_retail: supplyData.totalCost + totalExamRetail,
            insurance_savings: (supplyData.totalCost + totalExamRetail) - supplyData.finalCost,
            quote_details: {
                type: 'Contacts',
                supply: supplyData.label,
                lens_brand: lens.contact_name,
                exams: Object.entries(examSelections).filter(([,v]:any)=>v.value).map(([k,v]:any) => ({ name: k, selection: v.value })),
                vision_benefit: getCleanValue(visionBenefit),
                customer_approved: customerApproved,
            }
        };

        const { error } = await supabase.from('sales').insert([saleData]);

        if (error) {
            alert('There was an error saving the quote.');
        } else {
            alert('Quote saved successfully!');
            resetCalculator();
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
           {user && <Navigation userName={user.full_name || user.email} storeName={selectedStore?.name} currentPage="contacts" userRole={user.role || 'user'} />}

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                 <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Contact Lens Calculator</h1>
                    <p className="text-gray-600">Create comprehensive quotes for contact lenses and related services</p>
                </div>
                <div className="space-y-8">
                    {/* Customer Info */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader><CardTitle>Customer Information</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer-name">Customer Name *</Label>
                                <Input id="customer-name" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="insurance">Insurance Type</Label>
                                <Select value={insuranceType} onValueChange={setInsuranceType}>
                                    <SelectTrigger><SelectValue/></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="other">Other Insurance</SelectItem>
                                        <SelectItem value="vsp">VSP</SelectItem>
                                        <SelectItem value="declining">Declining Balance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </CardContent>
                    </Card>
                    
                    {/* Exams */}
                    <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                        <CardHeader><CardTitle>Eye Examinations</CardTitle></CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {examCategories.map(cat => (
                                <div key={cat.id} className="space-y-2">
                                    <Label>{cat.label}</Label>
                                    {cat.type === 'select' ? (
                                         <Select onValueChange={value => handleExamInputChange(cat.id, 'value', value)}>
                                             <SelectTrigger><SelectValue placeholder={`Select ${cat.label}`} /></SelectTrigger>
                                             <SelectContent>
                                                 {examListData.filter(i => i.Category === cat.dbCategory).map(item => (
                                                     <SelectItem key={item.exam_type} value={item.exam_type}>{item.exam_type}</SelectItem>
                                                 ))}
                                             </SelectContent>
                                         </Select>
                                    ) : (
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id={`checkbox-${cat.id}`} onCheckedChange={checked => handleExamInputChange(cat.id, 'value', checked ? examListData.find(i=>i.Category === cat.dbCategory)?.exam_type : false)}/>
                                            <Label htmlFor={`checkbox-${cat.id}`}>{examListData.find(i=>i.Category === cat.dbCategory)?.exam_type}</Label>
                                        </div>
                                    )}
                                    {examSelections[cat.id]?.value && (
                                         <div className="grid grid-cols-3 gap-2">
                                             <Input placeholder="Allowance" onChange={e => handleExamInputChange(cat.id, 'allowance', e.target.value)}/>
                                             <Input placeholder="Discount" onChange={e => handleExamInputChange(cat.id, 'discount', e.target.value)}/>
                                             <Input placeholder="CoPay" onChange={e => handleExamInputChange(cat.id, 'copay', e.target.value)}/>
                                         </div>
                                    )}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    
                    {/* Contacts and Summary */}
                    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                        {/* Config */}
                        <div className="lg:col-span-2">
                             <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader><CardTitle>Contact Lens Configuration</CardTitle></CardHeader>
                                <CardContent className="space-y-6">
                                     <div className="space-y-2">
                                         <Label htmlFor="contact-lens">Contact Lens Brand & Type *</Label>
                                          <Select value={selectedLensId} onValueChange={setSelectedLensId}>
                                             <SelectTrigger><SelectValue placeholder="Select contact lens"/></SelectTrigger>
                                             <SelectContent>
                                                 {contactLensDatabase.map(lens => (
                                                     <SelectItem key={lens.id} value={lens.id.toString()}>{lens.contact_name}</SelectItem>
                                                 ))}
                                             </SelectContent>
                                          </Select>
                                     </div>
                                     <div className="space-y-2">
                                         <Label>Lens Type</Label>
                                         <p className="h-10 flex items-center px-3 border rounded-md bg-gray-50 text-gray-500 italic">{contactLensDatabase.find(l=>l.id.toString() === selectedLensId)?.contact_type || 'Will be populated'}</p>
                                     </div>
                                     <div className="space-y-2">
                                         <Label htmlFor="vision-benefit">Vision Plan Benefit</Label>
                                         <Input id="vision-benefit" placeholder="$0.00" value={visionBenefit} onChange={e=>setVisionBenefit(e.target.value)}/>
                                     </div>
                                     <div className="space-y-2">
                                         <Label>Wearer Type</Label>
                                         <div className="flex items-center space-x-2">
                                             <Label htmlFor="wearer-toggle">New Wearer</Label>
                                             <Switch id="wearer-toggle" checked={wearerType === 'current'} onCheckedChange={checked => setWearerType(checked ? 'current' : 'new')}/>
                                             <Label htmlFor="wearer-toggle">Current Wearer</Label>
                                         </div>
                                     </div>
                                </CardContent>
                            </Card>
                        </div>
                        {/* Summary */}
                        <div className="lg:col-span-3">
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader><CardTitle>Supply Options</CardTitle></CardHeader>
                                <CardContent>
                                    {summary ? (
                                        <table className="w-full text-sm text-right">
                                            <thead>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 px-1"></th>
                                                    <th className="py-2 px-1">3 MONTHS</th>
                                                    <th className="py-2 px-1">6 MONTHS</th>
                                                    <th className="py-2 px-1 text-emerald-600 font-bold">ANNUAL</th>
                                                </tr>
                                                <tr className="border-b">
                                                    <th className="text-left py-2 px-1">Select Supply</th>
                                                    <td><Checkbox onCheckedChange={c => setSelectedSupply(c ? '3m' : undefined)} checked={selectedSupply==='3m'}/></td>
                                                    <td><Checkbox onCheckedChange={c => setSelectedSupply(c ? '6m' : undefined)} checked={selectedSupply==='6m'}/></td>
                                                    <td><Checkbox onCheckedChange={c => setSelectedSupply(c ? 'annual' : undefined)} checked={selectedSupply==='annual'}/></td>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y">
                                                <tr><th className="text-left py-2 px-1">No. of Boxes</th><td>{summary.results['3m'].boxes}</td><td>{summary.results['6m'].boxes}</td><td>{summary.results.annual.boxes}</td></tr>
                                                <tr><th className="text-left py-2 px-1">Price / Box</th><td colSpan={3} className="text-center">{formatCurrency(summary.lens.price)}</td></tr>
                                                <tr><th className="text-left py-2 px-1">Total Cost</th><td>{formatCurrency(summary.results['3m'].totalCost)}</td><td>{formatCurrency(summary.results['6m'].totalCost)}</td><td>{formatCurrency(summary.results.annual.totalCost)}</td></tr>
                                                <tr><th className="text-left py-2 px-1 text-green-600">Vision Plan Benefit</th><td className="text-green-600">-{formatCurrency(summary.results['3m'].benefit)}</td><td className="text-green-600">-{formatCurrency(summary.results['6m'].benefit)}</td><td className="text-green-600">-{formatCurrency(summary.results.annual.benefit)}</td></tr>
                                                <tr><th className="text-left py-2 px-1 text-green-600">Mfr. Mail in Rebate</th><td className="text-green-600">-{formatCurrency(summary.results['3m'].rebate)}</td><td className="text-green-600">-{formatCurrency(summary.results['6m'].rebate)}</td><td className="text-green-600">-{formatCurrency(summary.results.annual.rebate)}</td></tr>
                                                <tr><th className="text-left py-2 px-1 text-green-600">Store Discount (5%)</th><td className="text-green-600">-{formatCurrency(summary.results['3m'].storeDiscount)}</td><td className="text-green-600">-{formatCurrency(summary.results['6m'].storeDiscount)}</td><td className="text-green-600">-{formatCurrency(summary.results.annual.storeDiscount)}</td></tr>
                                                <tr><th className="text-left py-2 px-1">Sales Tax (6%)</th><td>{formatCurrency(summary.results['3m'].tax)}</td><td>{formatCurrency(summary.results['6m'].tax)}</td><td>{formatCurrency(summary.results.annual.tax)}</td></tr>
                                                <tr><th className="text-left py-2 px-1 font-bold">Cost / Box</th><td className="font-bold">{formatCurrency(summary.results['3m'].costPerBox)}</td><td className="font-bold">{formatCurrency(summary.results['6m'].costPerBox)}</td><td className="font-bold">{formatCurrency(summary.results.annual.costPerBox)}</td></tr>
                                                <tr><th className="text-left py-2 px-1 font-bold">Exams Total</th><td colSpan={3} className="text-center font-bold">{formatCurrency(examTotal)}</td></tr>
                                                <tr className="border-t-2"><th className="text-left py-2 px-1 font-bold text-lg">Today's Total</th><td className="font-bold text-lg">{formatCurrency(summary.results['3m'].finalCost)}</td><td className="font-bold text-lg">{formatCurrency(summary.results['6m'].finalCost)}</td><td className="font-bold text-xl text-emerald-600">{formatCurrency(summary.results.annual.finalCost)}</td></tr>
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div className="text-center py-12"><Contact className="w-12 h-12 mx-auto text-gray-400 mb-4"/><p>Select a contact lens to see pricing.</p></div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    {/* Actions */}
                    <div className="flex justify-between mt-8">
                        <Button onClick={resetCalculator} variant="outline">Reset Calculator</Button>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="customer-approval" checked={customerApproved} onCheckedChange={checked=>setCustomerApproved(Boolean(checked))}/>
                                <Label htmlFor="customer-approval">Customer has approved quote.</Label>
                            </div>
                            <Button onClick={saveQuote} disabled={!customerApproved || !selectedSupply} className="bg-emerald-600 hover:bg-emerald-700"><ShoppingCart className="w-4 h-4 mr-2"/>Save Quote</Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
