// app/calculator/page.tsx
"use client"

import { useState, useMemo, useEffect } from "react"
import { Calculator, ShoppingCart, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Navigation } from "@/components/navigation"
import { supabase } from "@/supabase-client.js"

// Helper functions from your original calculator
const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(amount || 0);

const getCleanValue = (value: string | number) => {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
        return parseFloat(value.replace(/[$,%]/g, '')) || 0;
    }
    return 0;
};

export default function CalculatorPage() {
    const [customerName, setCustomerName] = useState("")
    const [insuranceType, setInsuranceType] = useState("Other Insurance")
    const [globalAllowance, setGlobalAllowance] = useState('');
    const [globalDiscount, setGlobalDiscount] = useState('');
    const [globalDiscountInput, setGlobalDiscountInput] = useState('');

    const [priceListData, setPriceListData] = useState<any[]>([]);
    const [examListData, setExamListData] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [selectedStore, setSelectedStore] = useState<any>(null);

    const [selections, setSelections] = useState<any>({});
    const [addonCounter, setAddonCounter] = useState(0);
    const [addons, setAddons] = useState<any[]>([]);

    const categories = [
        { id: 'Rx', label: 'Rx' },
        { id: 'Lens Type', label: 'Lens Design' },
        { id: 'Material', label: 'Material' },
        { id: 'Coatings', label: 'Coatings' },
        { id: 'Backside UV', label: 'Backside UV', type: 'checkbox' },
        { id: 'Edge Polish', label: 'Edge Polish', type: 'checkbox', defaultChecked: true },
        { id: 'Color', label: 'Color' },
        { id: "Custom Measurements", label: "Custom Measurements" },
        { id: 'Blue Light', label: 'Blue Light Filter', type: 'checkbox' },
        { id: 'Protection', label: '1Yr. Protection', type: 'checkbox' },
    ];

    const examCategories = [
        { id: 'eye-exam', label: 'Eye Exam', dbCategory: 'Eye Exam', type: 'select' },
        { id: 'contacts-exam', label: 'Contacts Exam', dbCategory: 'Contacts Exam', type: 'select'},
        { id: 'refraction', label: 'Refraction', dbCategory: 'Refraction', type: 'checkbox' },
        { id: 'retinal-fundus-photos', label: 'Retinal Fundus Photos', dbCategory: 'Retinal Fundus Photos', type: 'checkbox' }
    ];

    useEffect(() => {
        const checkUserAndFetchData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                window.location.href = '/';
                return;
            }
            
            // Skip store selection for admin users
            const isAdmin = user.user_metadata?.user_role === 'admin';
            const storeData = sessionStorage.getItem('selectedStore');
            
            if (!storeData) {
                window.location.href = '/store-select';
                return;
            }
            setSelectedStore(JSON.parse(storeData));

            const { data: profile } = await supabase.from('profiles').select('full_name, role').eq('id', user.id).single();
            setUser({ ...user, ...profile });

            const componentsPromise = supabase.from('components').select('*').eq('is_active', true);
            const examsPromise = supabase.from('exams').select('*').eq('is_active', true);

            const [componentsResult, examsResult] = await Promise.all([componentsPromise, examsPromise]);

            if (componentsResult.data) setPriceListData([{ "Item": "None", "Category": "All", "Retail": 0 }, ...componentsResult.data]);
            if (examsResult.data) setExamListData([{ "exam_type": "None", "Category": "All", "price_retail": 0 }, ...examsResult.data]);
        };
        checkUserAndFetchData();
    }, []);

    const handleInputChange = (category: string, field: string, value: any) => {
        setSelections((prev: any) => ({
            ...prev,
            [category]: {
                ...prev[category],
                [field]: value
            }
        }));
    };

    const addAddonRow = () => {
        const newId = addonCounter + 1;
        setAddonCounter(newId);
        setAddons(prev => [...prev, { id: newId, name: 'No Extras' }]);
    };

    const removeAddonRow = (id: string) => {
        setAddons(prev => prev.filter(addon => addon.id !== id));
    };
    
    const handleAddonSelectChange = (id: string, value: string) => {
        setAddons(prev => prev.map(addon => addon.id === id ? { ...addon, name: value } : addon));
    };

    const calculateItem = (inputs: any, isFrame = false, isCopayOnly = false) => {
        let finalCost, yourCost, insSvgs;

        if (isCopayOnly) {
            finalCost = inputs.copay;
            yourCost = 0; 
            insSvgs = inputs.retail - finalCost;
        } else { 
            if (isFrame) {
                 yourCost = (inputs.retail - inputs.insAllow) * (1 - (inputs.discount / 100));
            } else {
                 yourCost = inputs.retail * (1 - (inputs.discount / 100)) - inputs.insAllow;
            }
            yourCost = Math.max(0, yourCost);
            finalCost = yourCost + inputs.copay;
            insSvgs = inputs.retail - finalCost;
        }
        
        return { yourCost, finalCost, insSvgs };
    };

    const summary = useMemo(() => {
        let totalRetail = 0;
        let totalInsSvgs = 0;
        let totalFinalCost = 0;
        const summaryItems: any[] = [];
        
        const isDecliningBalance = insuranceType === 'Declining Balance';
        const isGlobalDiscountScenario = insuranceType === 'No Insurance' || insuranceType === 'Second Pair';

        // Process Exams
        let examTotalRetail = 0;
        if (insuranceType !== 'Second Pair') {
            examCategories.forEach(cat => {
                const selection = selections[cat.id] || {};
                const selectedValue = selection.value;

                if (!selectedValue || selectedValue === "None") return;

                const selectedItem = examListData.find(p => p.exam_type === selectedValue);
                if (!selectedItem) return;

                const inputs = {
                    retail: selectedItem.price_retail,
                    insAllow: getCleanValue(selection.allowance),
                    discount: getCleanValue(selection.discount),
                    copay: getCleanValue(selection.copay),
                };
                examTotalRetail += inputs.retail;

                const calc = calculateItem(inputs, false, !inputs.insAllow && !inputs.discount && !!inputs.copay);
                totalRetail += inputs.retail;
                totalInsSvgs += calc.insSvgs;
                totalFinalCost += calc.finalCost;
                summaryItems.push({ id: cat.id, title: cat.label, inputs, outputs: calc, isExam: true });
            });
        }

        // Process Frame
        const frameRetail = getCleanValue(selections.frame?.price);
        if (frameRetail > 0) {
            const frameInputs = {
                retail: frameRetail,
                insAllow: getCleanValue(selections.frame?.allowance),
                discount: isGlobalDiscountScenario ? getCleanValue(globalDiscountInput) : getCleanValue(selections.frame?.discount),
                copay: 0,
            };

            const frameCalc = calculateItem(frameInputs, true);
            totalRetail += frameInputs.retail;
            if (!isDecliningBalance) {
                totalInsSvgs += frameCalc.insSvgs;
                totalFinalCost += frameCalc.finalCost;
            }
            summaryItems.push({ id: 'frame', title: 'Frame', inputs: frameInputs, outputs: frameCalc });
        }
        
        // Process Lenses
        let nonExamProtectionRetail = 0;
        categories.forEach(cat => {
            const selection = selections[cat.id] || {};
            const selectedValue = selection.value;

            if (!selectedValue || selectedValue === "None") return;

            const selectedItem = priceListData.find(p => p.Item === selectedValue);
            if (!selectedItem) return;

            const inputs = {
                retail: selectedItem.Retail,
                insAllow: getCleanValue(selection.allowance),
                discount: isGlobalDiscountScenario && cat.id !== 'Protection' ? getCleanValue(globalDiscountInput) : getCleanValue(selection.discount),
                copay: getCleanValue(selection.copay),
            };
            if(cat.id === 'Protection') nonExamProtectionRetail += inputs.retail;

            const calc = calculateItem(inputs);
            totalRetail += inputs.retail;
            if (!isDecliningBalance) {
                totalInsSvgs += calc.insSvgs;
                totalFinalCost += calc.finalCost;
            }
            summaryItems.push({ id: cat.id, title: cat.label, inputs, outputs: calc });
        });

        // Process Addons
        addons.forEach(addon => {
             const selectedItem = priceListData.find(p => p.Item === addon.name);
             if (!selectedItem || selectedItem.Item === 'No Extras') return;
             const selection = selections[`addon-${addon.id}`] || {};
             const inputs = {
                retail: selectedItem.Retail,
                insAllow: getCleanValue(selection.allowance),
                discount: isGlobalDiscountScenario ? getCleanValue(globalDiscountInput) : getCleanValue(selection.discount),
                copay: getCleanValue(selection.copay),
            };
             const calc = calculateItem(inputs);
             totalRetail += inputs.retail;
             if (!isDecliningBalance) {
                 totalInsSvgs += calc.insSvgs;
                 totalFinalCost += calc.finalCost;
             }
             summaryItems.push({id: `addon-${addon.id}`, title: addon.name, inputs, outputs: calc});
        });

        // Final Declining Balance Calculation
        if (isDecliningBalance) {
            const eligibleRetail = totalRetail - examTotalRetail - nonExamProtectionRetail;
            const decliningBalanceCost = Math.max(0, (eligibleRetail - getCleanValue(globalAllowance)) * (1 - (getCleanValue(globalDiscount) / 100)));
            totalFinalCost = examTotalRetail + nonExamProtectionRetail + decliningBalanceCost;
            totalInsSvgs = totalRetail - totalFinalCost;
        }


        return { totalRetail, totalInsSvgs, totalFinalCost, items: summaryItems };
    }, [selections, addons, insuranceType, globalAllowance, globalDiscount, globalDiscountInput, priceListData, examListData]);
    


    const resetCalculator = () => {
        setCustomerName('');
        setInsuranceType('Other Insurance');
        setGlobalAllowance('');
        setGlobalDiscount('');
        setGlobalDiscountInput('');
        setSelections({});
        setAddons([]);
        setAddonCounter(0);
    };

    const saveQuote = async () => {
        if (!customerName) {
            alert("Please enter a customer name before saving.");
            return;
        }
        if (!selections.customerApproval) {
            alert("Please have the customer approve the quote by checking the box before saving.");
            return;
        }

        const quoteDetails = {
            exams: summary.items.filter(i => i.isExam).map(i => ({ name: i.title, selection: i.inputs.value, price: i.outputs.finalCost })),
            frame: summary.items.find(i => i.id === 'frame') ? { price: summary.items.find(i => i.id === 'frame').inputs.retail, finalCost: summary.items.find(i => i.id === 'frame').outputs.finalCost } : {},
            lenses: summary.items.filter(i => !i.isExam && i.id !== 'frame' && !i.id.startsWith('addon')).reduce((acc, i) => ({ ...acc, [i.title]: { selection: i.inputs.value, price: i.outputs.finalCost } }), {}),
            addOns: summary.items.filter(i => i.id.startsWith('addon')).map(i => ({ selection: i.title, price: i.outputs.finalCost })),
            customer_approved: true
        };

        const saleData = {
            optician_id: user.id,
            store_id: selectedStore.id,
            customer_name: customerName,
            final_cost: summary.totalFinalCost,
            total_retail: summary.totalRetail,
            insurance_savings: summary.totalInsSvgs,
            quote_details: quoteDetails
        };

        const { error } = await supabase.from('sales').insert([saleData]);
        if (error) {
            alert('There was an error saving the quote. Please try again.');
        } else {
            alert('Quote saved successfully!');
            resetCalculator();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <Navigation 
                userName={user?.full_name || 'User'} 
                storeName={selectedStore?.name || 'Pearle Vision'}
                currentPage="calculator" 
                userRole={user?.role || 'user'}
            />
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Glasses Calculator</h1>
                    <p className="text-gray-600">Create comprehensive quotes for eyeglasses and related services</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Customer Info */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader><CardTitle className="text-xl">Customer Information</CardTitle></CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="customer-name">Customer Name *</Label>
                                    <Input id="customer-name" placeholder="Enter customer's full name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="insurance">Insurance Type</Label>
                                    <Select value={insuranceType} onValueChange={setInsuranceType}>
                                        <SelectTrigger><SelectValue /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Other Insurance">Other Insurance</SelectItem>
                                            <SelectItem value="VSP">VSP</SelectItem>
                                            <SelectItem value="Declining Balance">Declining Balance</SelectItem>
                                            <SelectItem value="No Insurance">No Insurance</SelectItem>
                                            <SelectItem value="Second Pair">Second Pair</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                {insuranceType === 'Declining Balance' && (
                                     <div className="md:col-span-2 grid grid-cols-2 gap-4">
                                         <div className="space-y-2">
                                             <Label>Global Allowance</Label>
                                             <Input placeholder="Allowance" value={globalAllowance} onChange={e => setGlobalAllowance(e.target.value)} />
                                         </div>
                                         <div className="space-y-2">
                                             <Label>Global Discount</Label>
                                             <Input placeholder="Discount" value={globalDiscount} onChange={e => setGlobalDiscount(e.target.value)} />
                                         </div>
                                     </div>
                                )}
                                {(insuranceType === 'No Insurance' || insuranceType === 'Second Pair') && (
                                    <div className="md:col-span-2">
                                         <Label>Global Discount</Label>
                                         <Input placeholder="Discount" value={globalDiscountInput} onChange={e => setGlobalDiscountInput(e.target.value)} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        
                        {/* Exams */}
                        {insuranceType !== 'Second Pair' && (
                            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                                <CardHeader><CardTitle className="text-xl">Eye Examinations</CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {examCategories.map(cat => (
                                        <div key={cat.id} className="space-y-2">
                                            <Label>{cat.label}</Label>
                                            {cat.type === 'select' ? (
                                                 <Select onValueChange={value => handleInputChange(cat.id, 'value', value)}>
                                                     <SelectTrigger><SelectValue placeholder={`Select ${cat.label}`} /></SelectTrigger>
                                                     <SelectContent>
                                                         {examListData.filter(i => i.Category === cat.dbCategory).map(item => (
                                                             <SelectItem key={item.exam_type} value={item.exam_type}>{item.exam_type}</SelectItem>
                                                         ))}
                                                     </SelectContent>
                                                 </Select>
                                            ) : (
                                                <div className="flex items-center space-x-2">
                                                    <Checkbox id={`checkbox-${cat.id}`} onCheckedChange={checked => handleInputChange(cat.id, 'value', checked ? examListData.find(i=>i.Category === cat.dbCategory)?.exam_type : false)}/>
                                                    <Label htmlFor={`checkbox-${cat.id}`}>{examListData.find(i=>i.Category === cat.dbCategory)?.exam_type}</Label>
                                                </div>
                                            )}
                                            {selections[cat.id]?.value && (
                                                 <div className="grid grid-cols-3 gap-2">
                                                     <Input placeholder="Allowance" onChange={e => handleInputChange(cat.id, 'allowance', e.target.value)}/>
                                                     <Input placeholder="Discount" onChange={e => handleInputChange(cat.id, 'discount', e.target.value)}/>
                                                     <Input placeholder="CoPay" onChange={e => handleInputChange(cat.id, 'copay', e.target.value)}/>
                                                 </div>
                                            )}
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        )}

                        {/* Frame & Lens */}
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                            <CardHeader><CardTitle>Frame & Lens Configuration</CardTitle></CardHeader>
                            <CardContent className="space-y-6">
                                 {/* Frame */}
                                 <div className="space-y-2">
                                     <Label>Frame Details</Label>
                                     <div className="grid grid-cols-3 gap-2">
                                         <Input placeholder="Price" onChange={e=>handleInputChange('frame', 'price', e.target.value)}/>
                                         <Input placeholder="Allowance" onChange={e=>handleInputChange('frame', 'allowance', e.target.value)}/>
                                         <Input placeholder="Discount" onChange={e=>handleInputChange('frame', 'discount', e.target.value)}/>
                                     </div>
                                 </div>
                                 <Separator/>
                                 {/* Lenses */}
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                     {categories.map(cat=>(
                                         <div key={cat.id} className="space-y-2">
                                             <Label>{cat.label}</Label>
                                              {cat.type === 'checkbox' ? (
                                                  <div className="flex items-center space-x-2">
                                                      <Checkbox id={`checkbox-${cat.id}`} defaultChecked={cat.defaultChecked} onCheckedChange={checked => handleInputChange(cat.id, 'value', checked ? priceListData.find(i=>i.Category === cat.id)?.Item : false)}/>
                                                      <Label htmlFor={`checkbox-${cat.id}`}>{priceListData.find(i=>i.Category === cat.id)?.Item}</Label>
                                                  </div>
                                              ) : (
                                                  <Select onValueChange={value => handleInputChange(cat.id, 'value', value)}>
                                                      <SelectTrigger><SelectValue placeholder={`Select ${cat.label}`}/></SelectTrigger>
                                                      <SelectContent>
                                                           {priceListData.filter(i => i.Category === cat.id).map(item => (
                                                              <SelectItem key={item.Item} value={item.Item}>{item.Item}</SelectItem>
                                                          ))}
                                                      </SelectContent>
                                                  </Select>
                                              )}
                                              {selections[cat.id]?.value && (
                                                  <div className="grid grid-cols-3 gap-2">
                                                      <Input placeholder="Allowance" onChange={e => handleInputChange(cat.id, 'allowance', e.target.value)}/>
                                                      <Input placeholder="Discount" onChange={e => handleInputChange(cat.id, 'discount', e.target.value)}/>
                                                      <Input placeholder="CoPay" onChange={e => handleInputChange(cat.id, 'copay', e.target.value)}/>
                                                  </div>
                                              )}
                                         </div>
                                     ))}
                                 </div>
                                 <Separator/>
                                 {/* Addons */}
                                 <div className="space-y-4">
                                     <Label>Add-ons</Label>
                                     {addons.map(addon => (
                                         <div key={addon.id} className="space-y-2">
                                             <div className="flex items-center gap-2">
                                                 <Select onValueChange={value => handleAddonSelectChange(addon.id, value)}>
                                                     <SelectTrigger><SelectValue placeholder="Select an add-on"/></SelectTrigger>
                                                     <SelectContent>
                                                         {priceListData.filter(i => i.Category === 'Add-Ons').map(item => (
                                                             <SelectItem key={item.Item} value={item.Item}>{item.Item}</SelectItem>
                                                         ))}
                                                     </SelectContent>
                                                 </Select>
                                                 <Button variant="ghost" size="icon" onClick={() => removeAddonRow(addon.id)}><Trash2 className="w-4 h-4"/></Button>
                                             </div>
                                             {addon.name !== 'No Extras' && (
                                                  <div className="grid grid-cols-3 gap-2">
                                                      <Input placeholder="Allowance" onChange={e => handleInputChange(`addon-${addon.id}`, 'allowance', e.target.value)}/>
                                                      <Input placeholder="Discount" onChange={e => handleInputChange(`addon-${addon.id}`, 'discount', e.target.value)}/>
                                                      <Input placeholder="CoPay" onChange={e => handleInputChange(`addon-${addon.id}`, 'copay', e.target.value)}/>
                                                  </div>
                                             )}
                                         </div>
                                     ))}
                                     <Button variant="outline" onClick={addAddonRow}><Plus className="w-4 h-4 mr-2"/>Add Add-On</Button>
                                 </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Summary Sidebar */}
                    <div className="lg:col-span-1">
                        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg sticky top-24">
                            <CardHeader><CardTitle>Quote Summary</CardTitle></CardHeader>
                            <CardContent className="space-y-4">
                                {customerName && <p className="font-medium">{customerName}</p>}
                                <Separator />
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {summary.items.length > 0 ? summary.items.map(item => (
                                        <div key={item.id} className="text-sm">
                                            <div className="flex justify-between">
                                                <span>{item.title}</span>
                                                <span className="font-medium">{formatCurrency(item.outputs.finalCost)}</span>
                                            </div>
                                        </div>
                                    )) : <p className="text-sm text-gray-500">No items selected.</p>}
                                </div>
                                <Separator/>
                                <div className="space-y-1 text-sm">
                                    <div className="flex justify-between"><span>Retail Total</span><span>{formatCurrency(summary.totalRetail)}</span></div>
                                    <div className="flex justify-between text-emerald-600"><span>Insurance Savings</span><span>{formatCurrency(summary.totalInsSvgs)}</span></div>
                                </div>
                                <Separator/>
                                <div className="flex justify-between items-center">
                                    <span className="text-lg font-semibold">Final Cost</span>
                                    <span className="text-2xl font-bold text-emerald-600">{formatCurrency(summary.totalFinalCost)}</span>
                                </div>
                                <div className="flex items-center space-x-2 pt-4">
                                    <Checkbox id="customer-approval" onCheckedChange={checked => handleInputChange('customerApproval', 'value', checked)}/>
                                    <Label htmlFor="customer-approval">Customer has approved the quote.</Label>
                                </div>
                                <div className="flex gap-2 pt-4">
                                     <Button onClick={resetCalculator} variant="outline" className="w-full">Reset</Button>
                                     <Button onClick={saveQuote} className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={!selections.customerApproval?.value}>Save Quote</Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
