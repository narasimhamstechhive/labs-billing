import React, { useEffect, useState } from 'react';
import { reportsAPI } from '../../services/api';
import { ClipboardList, AlertTriangle, CheckCircle2, ArrowLeft, Plus, Trash2, FileText, TestTube } from 'lucide-react';
import toast from 'react-hot-toast';

const ResultEntry = () => {
    const [samples, setSamples] = useState([]);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [limit] = useState(10);
    const [selectedSample, setSelectedSample] = useState(null);
    const [results, setResults] = useState({});
    const [loading, setLoading] = useState(false);

    const fetchSamples = async (pageNum = page) => {
        try {
            const { data } = await reportsAPI.getPending({ page: pageNum, limit });
            setSamples(data.samples || []);
            setPages(data.pages || 1);
            setPage(data.page || 1);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        fetchSamples();
    }, [page]);

    const handleSelectSample = (sample) => {
        setSelectedSample(sample);
        const initialResults = {};
        sample.tests.forEach(t => {
            initialResults[t._id] = {
                value: '',
                remarks: '',
                abnormal: false,
                subtests: []
            };
        });
        setResults(initialResults);
    };

    const handleResultChange = (testId, field, value) => {
        setResults(prev => ({
            ...prev,
            [testId]: {
                ...prev[testId],
                [field]: value
            }
        }));
    };

    const handleAddSubtest = (testId) => {
        setResults(prev => ({
            ...prev,
            [testId]: {
                ...prev[testId],
                subtests: [
                    ...prev[testId].subtests,
                    { testName: '', resultValue: '', unit: '', normalRange: '', abnormal: false }
                ]
            }
        }));
    };

    const handleSubtestChange = (testId, subIndex, field, value) => {
        const newSubtests = [...results[testId].subtests];
        newSubtests[subIndex][field] = value;
        setResults(prev => ({
            ...prev,
            [testId]: {
                ...prev[testId],
                subtests: newSubtests
            }
        }));
    };

    const removeSubtest = (testId, subIndex) => {
        const newSubtests = results[testId].subtests.filter((_, i) => i !== subIndex);
        setResults(prev => ({
            ...prev,
            [testId]: {
                ...prev[testId],
                subtests: newSubtests
            }
        }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                sampleId: selectedSample._id,
                results: Object.keys(results).map(testId => ({
                    testId,
                    ...results[testId]
                }))
            };
            await reportsAPI.submit(payload);
            toast.success('Results submitted successfully!');
            setSelectedSample(null);
            fetchSamples();
        } catch (err) {
            toast.error('Failed to submit results');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Result Entry</h1>
                    <p className="text-gray-500 mt-1">Enter test results for collected samples</p>
                </div>
                {selectedSample && (
                    <button
                        onClick={() => setSelectedSample(null)}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span>Back to Samples</span>
                    </button>
                )}
            </div>


            {!selectedSample ? (
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <ClipboardList className="w-5 h-5 text-primary-600" />
                        Pending Samples
                        <span className="bg-primary-50 text-primary-700 text-xs px-2 py-1 rounded-full">{samples.length}</span>
                    </h3>

                    {samples.length === 0 ? (
                        <div className="text-center py-16 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200">
                            <TestTube className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 font-medium">No pending samples found</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {samples.map(s => (
                                <div
                                    key={s._id}
                                    className="group relative bg-white border border-gray-200 rounded-xl p-5 hover:border-primary-500 hover:shadow-md transition-all cursor-pointer"
                                    onClick={() => handleSelectSample(s)}
                                >
                                    <div className="absolute top-4 right-4">
                                        <span className={`px-2 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${s.sampleType === 'Blood' ? 'bg-rose-50 text-rose-600' :
                                                s.sampleType === 'Urine' ? 'bg-yellow-50 text-yellow-600' :
                                                    'bg-gray-100 text-gray-600'
                                            }`}>
                                            {s.sampleType}
                                        </span>
                                    </div>

                                    <div className="mb-4">
                                        <h4 className="font-bold text-gray-900 text-lg group-hover:text-primary-600 transition-colors">
                                            {s.patient.name}
                                        </h4>
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                                            <span className="font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 font-medium">#{s.sampleId}</span>
                                            <span>•</span>
                                            <span>{s.patient.age}Y / {s.patient.gender.charAt(0)}</span>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Tests Requested</p>
                                        <div className="flex flex-wrap gap-2">
                                            {s.tests.slice(0, 3).map(t => (
                                                <span key={t._id} className="inline-flex items-center px-2 py-1 bg-primary-50 text-primary-700 text-xs font-medium rounded-md border border-primary-100/50">
                                                    {t.testName}
                                                </span>
                                            ))}
                                            {s.tests.length > 3 && (
                                                <span className="inline-flex items-center px-2 py-1 bg-gray-50 text-gray-600 text-xs font-medium rounded-md">
                                                    +{s.tests.length - 3} more
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between text-sm">
                                        <span className="text-gray-400 font-medium">Ready for entry</span>
                                        <div className="flex items-center gap-1 text-primary-600 font-bold group-hover:gap-2 transition-all">
                                            Enter Results <ArrowLeft className="w-4 h-4 rotate-180" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Pagination */}
                    {pages > 1 && (
                        <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-100">
                            <p className="text-sm text-gray-500 font-medium">
                                Page <span className="text-gray-900">{page}</span> of {pages}
                            </p>
                            <div className="flex gap-2">
                                <button
                                    disabled={page === 1}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"
                                >
                                    Previous
                                </button>
                                <button
                                    disabled={page === pages}
                                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                                    className="px-4 py-2 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50 transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="max-w-5xl mx-auto space-y-6">
                    {/* Patient Context Header */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold text-xl">
                                {selectedSample.patient.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 leading-tight">{selectedSample.patient.name}</h2>
                                <div className="text-sm text-gray-500 flex items-center gap-2 mt-0.5">
                                    <span className="font-mono font-medium text-gray-700">#{selectedSample.sampleId}</span>
                                    <span>•</span>
                                    <span>{selectedSample.patient.age}Y</span>
                                    <span>•</span>
                                    <span>{selectedSample.patient.gender}</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-xs font-bold text-gray-400 uppercase">Sample Type</p>
                                <p className="font-medium text-gray-900">{selectedSample.sampleType}</p>
                            </div>
                        </div>
                    </div>

                    {/* Result Entry Form */}
                    <div className="space-y-6">
                        {selectedSample.tests.map(test => (
                            <div key={test._id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                                {/* Test Header */}
                                <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h4 className="font-bold text-gray-900 text-lg flex items-center gap-2">
                                            <TestTube className="w-5 h-5 text-gray-400" />
                                            {test.testName}
                                        </h4>
                                        <p className="text-xs text-gray-500 mt-1 pl-7">
                                            Ref. Range: <span className="font-medium text-gray-700">{test.normalRanges?.general || `${test.normalRanges?.male?.min || 0} - ${test.normalRanges?.male?.max || 0}`}</span>
                                            <span className="mx-2">•</span>
                                            Unit: <span className="font-medium text-gray-700">{test.unit || 'N/A'}</span>
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => handleAddSubtest(test._id)}
                                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 hover:text-primary-600 transition-colors shadow-sm"
                                    >
                                        <Plus className="w-4 h-4" /> Add Parameter
                                    </button>
                                </div>

                                <div className="p-6">
                                    {/* Main Result Fields */}
                                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                                        <div className="md:col-span-4 space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Result Value</label>
                                            <input
                                                placeholder="Enter Value"
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 font-bold text-gray-900"
                                                value={results[test._id]?.value || ''}
                                                onChange={e => handleResultChange(test._id, 'value', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-6 space-y-1.5">
                                            <label className="text-xs font-bold uppercase tracking-wide text-gray-500">Remarks</label>
                                            <input
                                                placeholder="Any observations..."
                                                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-gray-700"
                                                value={results[test._id]?.remarks || ''}
                                                onChange={e => handleResultChange(test._id, 'remarks', e.target.value)}
                                            />
                                        </div>
                                        <div className="md:col-span-2 pt-6">
                                            <label className={`flex items-center justify-center gap-2 px-3 py-2.5 border rounded-lg cursor-pointer transition-all select-none ${results[test._id]?.abnormal ? 'bg-rose-50 border-rose-200 text-rose-700 font-bold' : 'bg-gray-50 border-gray-200 text-gray-500 hover:bg-gray-100'}`}>
                                                <input
                                                    type="checkbox"
                                                    checked={results[test._id]?.abnormal || false}
                                                    onChange={e => handleResultChange(test._id, 'abnormal', e.target.checked)}
                                                    className="hidden"
                                                />
                                                <AlertTriangle className={`w-4 h-4 ${results[test._id]?.abnormal ? 'block' : 'hidden md:block'}`} />
                                                <span className="text-sm">{results[test._id]?.abnormal ? 'Abnormal' : 'Normal'}</span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Subtests Table */}
                                    {results[test._id]?.subtests?.length > 0 && (
                                        <div className="mt-8">
                                            <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 border-b border-gray-100 pb-2">Sub-Parameters</h5>
                                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                                                <table className="w-full text-sm text-left">
                                                    <thead className="bg-gray-50 text-gray-500 font-semibold border-b border-gray-200">
                                                        <tr>
                                                            <th className="px-4 py-2 w-1/3">Parameter Name</th>
                                                            <th className="px-4 py-2 w-1/4">Result</th>
                                                            <th className="px-4 py-2">Unit</th>
                                                            <th className="px-4 py-2">Ref. Range</th>
                                                            <th className="px-4 py-2 w-10"></th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-gray-100">
                                                        {results[test._id].subtests.map((sub, sIdx) => (
                                                            <tr key={sIdx} className="bg-white hover:bg-gray-50/50">
                                                                <td className="p-2 pl-4">
                                                                    <input
                                                                        placeholder="Parameter Name"
                                                                        className="w-full px-2 py-1.5 bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none font-medium text-gray-900 transition-colors"
                                                                        value={sub.testName}
                                                                        onChange={e => handleSubtestChange(test._id, sIdx, 'testName', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        placeholder="Value"
                                                                        className="w-full px-2 py-1.5 bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none font-bold text-primary-700 transition-colors"
                                                                        value={sub.resultValue}
                                                                        onChange={e => handleSubtestChange(test._id, sIdx, 'resultValue', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        placeholder="Unit"
                                                                        className="w-full px-2 py-1.5 bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none text-gray-500 text-xs"
                                                                        value={sub.unit}
                                                                        onChange={e => handleSubtestChange(test._id, sIdx, 'unit', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2">
                                                                    <input
                                                                        placeholder="Range"
                                                                        className="w-full px-2 py-1.5 bg-transparent border-b border-transparent focus:border-primary-400 focus:outline-none text-gray-500 italic text-xs"
                                                                        value={sub.normalRange}
                                                                        onChange={e => handleSubtestChange(test._id, sIdx, 'normalRange', e.target.value)}
                                                                    />
                                                                </td>
                                                                <td className="p-2 pr-4 text-center">
                                                                    <button
                                                                        onClick={() => removeSubtest(test._id, sIdx)}
                                                                        className="p-1.5 text-gray-400 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors"
                                                                        title="Remove Parameter"
                                                                    >
                                                                        <Trash2 className="w-4 h-4" />
                                                                    </button>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Submit Button */}
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold text-lg tracking-tight shadow-md disabled:opacity-50 flex items-center gap-3"
                        >
                            {loading ? (
                                <div className="px-2 py-2 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                            ) : (
                                <>

                                    <span> REPORT SUBMISSION</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResultEntry;
