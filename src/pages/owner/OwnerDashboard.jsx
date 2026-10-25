// import { useEffect, useState } from 'react';
// import {
//   HomeIcon,
//   Settings2Icon,
//   RadioIcon,
//   BarChart3Icon,
//   MessageSquareIcon,
//   UsersIcon,
// } from "lucide-react";
// import useAuthStore from "../../store/auth.store";
// import { RefreshCw, LoaderCircle } from "lucide-react";
// import api from "../../api/axios";

// const EMPTY_LIVE_QUEUE = {
//   Q2: { waiting: 0 },
//   Q4: { waiting: 0 },
//   Q6: { waiting: 0 },
//   Q8: { waiting: 0 }
// };

// const EMPTY_TODAY_SUMMARY = {
//   waiting: 0,
//   arrived: 0,
//   notArrived: 0,
//   cancelled: 0
// };

// const getPayload = (response) => response.data?.data ?? response.data;

// const getCount = (data, keys) => {
//   for (const key of keys) {
//     const value = data?.[key];
//     if (value !== undefined && value !== null) return Number(value) || 0;
//   }
//   return 0;
// };

// const normalizeLiveQueue = (data) => {
//   const queueData = data?.liveQueue ?? data?.live_queue ?? data?.queues ??
//     [];

//   if (Array.isArray(queueData)) {
//     const normalized = {
//       Q2: { waiting: 0 },
//       Q4: { waiting: 0 },
//       Q6: { waiting: 0 },
//       Q8: { waiting: 0 }
//     };

//     queueData.forEach((queue) => {
//       const queueType = queue?.queue_type;

//       if (!queueType) return;

//       if (normalized[queueType]) {
//         normalized[queueType] = {
//           waiting: Number(queue?.count) || 0
//         };
//       }
//     });

//     return normalized;
//   }

//   // Fallback if API returns an object instead of an array
//   return Object.fromEntries(
//     Object.keys(EMPTY_LIVE_QUEUE).map((queue) => {
//       const queueInfo = queueData?.[queue] ?? {};

//       const waiting =
//         typeof queueInfo === 'number'
//           ? queueInfo
//           : getCount(queueInfo, [
//             'waiting',
//             'waitingCount',
//             'waiting_count',
//             'count'
//           ]);

//       return [
//         queue,
//         {
//           waiting
//         }
//       ];
//     })
//   );
// };


// const normalizeTodaySummary = (data) => {
//   const summary = data?.todaySummary ?? data?.today_summary ?? data?.summary ?? data;

//   return {
//     waiting: getCount(summary, ['waiting', 'waitingCount', 'waiting_count']),
//     arrived: getCount(summary, ['arrived', 'arrivedCount', 'arrived_count']),
//     notArrived: getCount(summary, ['notArrived', 'not_arrived', 'notArrivedCount', 'not_arrived_count']),
//     cancelled: getCount(summary, ['cancelled', 'canceled', 'cancelledCount', 'cancelled_count'])
//   };
// };

// const fetchOwnerDashboardData = async (userId) => {
//   const shopResponse = await api.get(`/shops/profile/${userId}`);

//   const shopPayload = getPayload(shopResponse);
//   const shop = shopPayload?.shop ?? shopPayload;

//   const shopId = shop?.id ?? shop?._id;

//   if (!shopId) {
//     throw new Error('Shop ID was not returned for this owner.');
//   }

//   // ==========================================
//   // SAVE SHOP ID IN LOCAL STORAGE
//   // ==========================================
//   if (shopId) {
//     localStorage.setItem(
//       "shopId",
//       String(shopId)
//     );
//   }

//     const dashboardResponse = await api.get(`/dashboard/owner/${shopId}`);

//     const dashboardPayload = getPayload(dashboardResponse);
//     const dashboard = dashboardPayload?.dashboard ?? dashboardPayload;

//     return {
//       shop,
//       shopId,

//       shopName: shop?.shopName ?? shop?.name ?? '',

//       // Actual DB status fields
//       shopStatus: shop?.shopStatus ?? shop?.shop_status ?? 'inactive',

//       shopOpenStatus:
//         shop?.shopOpenStatus ??
//         shop?.shop_open_status ??
//         'close',

//       queueStatus:
//         shop?.queueStatus ??
//         shop?.queue_status ??
//         'pause',

//       liveQueue: normalizeLiveQueue(dashboard),
//       todaySummary: normalizeTodaySummary(dashboard)
//     };
//   };


//   const INITIAL_STAFF_STATUS = [
//     {
//       id: 's1',
//       staff_id: 'STF-101',
//       full_name: 'Sarah Connor',
//       role: 'counter',
//       is_logged_in: true,
//       login_time: '2026-09-19T08:30:00Z'
//     },
//     {
//       id: 's2',
//       staff_id: 'STF-102',
//       full_name: 'John Doe',
//       role: 'staff',
//       is_logged_in: true,
//       selected_section: 'Q4',
//       selected_section_login_time: '2026-09-19T09:15:00Z'
//     },
//     {
//       id: 's3',
//       staff_id: 'STF-103',
//       full_name: 'Emma Watson',
//       role: 'staff',
//       is_logged_in: true,
//       selected_section: 'Q8',
//       selected_section_login_time: '2026-09-19T10:00:00Z'
//     }
//   ];

//   export default function OwnerDashboard() {

//     const { user } = useAuthStore();

//     const [shopStatus, setShopStatus] = useState('inactive');
//     const [shopOpenStatus, setShopOpenStatus] = useState('close');
//     const [queueStatus, setQueueStatus] = useState('pause');

//     const [shopActionLoading, setShopActionLoading] = useState(false);
//     const [queueActionLoading, setQueueActionLoading] = useState(false);

//     const [shopName, setShopName] = useState('');
//     const [liveQueue, setLiveQueue] = useState(EMPTY_LIVE_QUEUE);
//     const [todaySummary, setTodaySummary] = useState(EMPTY_TODAY_SUMMARY);
//     const [staffStatus, setStaffStatus] = useState(INITIAL_STAFF_STATUS);

//     const [message, setMessage] = useState('');
//     const [sending, setSending] = useState(false);
//     const [refreshing, setRefreshing] = useState(false);
//     const [dashboardLoading, setDashboardLoading] = useState(Boolean(user?.id));
//     const [dashboardError, setDashboardError] = useState('');
//     const isOpen = shopOpenStatus === 'open';
//     const isActive = queueStatus === 'start';

//     useEffect(() => {
//       if (!user?.id) {
//         return undefined;
//       }

//       let cancelled = false;

//       fetchOwnerDashboardData(user.id)
//         .then(
//           ({
//             shopName: name,
//             liveQueue: queueData,
//             todaySummary: summaryData,
//             shopStatus: currentShopStatus,
//             shopOpenStatus: currentShopOpenStatus,
//             queueStatus: currentQueueStatus
//           }) => {
//             if (cancelled) return;

//             setShopName(name);

//             setShopStatus(currentShopStatus);
//             setShopOpenStatus(currentShopOpenStatus);
//             setQueueStatus(currentQueueStatus);

//             setLiveQueue(queueData);
//             setTodaySummary(summaryData);
//           }
//         )
//         .catch((error) => {
//           if (!cancelled) {
//             setDashboardError(
//               error.response?.data?.message ||
//               error.message ||
//               'Unable to load dashboard data.'
//             );
//           }
//         })
//         .finally(() => {
//           if (!cancelled) setDashboardLoading(false);
//         });


//       return () => {
//         cancelled = true;
//       };
//     }, [user?.id]);

//     // Section filter
//     const [activeSections, setActiveSections] = useState(['all']);

//     // Dynamic status check
//     const isSectionActive = (key) => activeSections.includes('all') || activeSections.includes(key);

//     // Toggle filter sections
//     const handleSectionClick = (key) => {
//       if (key === 'all') {
//         setActiveSections(['all']);
//         return;
//       }
//       setActiveSections((prev) => {
//         const current = prev.filter((item) => item !== 'all');
//         if (current.includes(key)) {
//           const updated = current.filter((item) => item !== key);
//           return updated.length === 0 ? ['all'] : updated;
//         }
//         return [...current, key];
//       });
//     };

//     // Actions
//     const refreshDashboard = async () => {
//       if (!user?.id) return;

//       setRefreshing(true);
//       setDashboardError('');
//       try {
//         const {
//           shopName: name,
//           liveQueue: queueData,
//           todaySummary: summaryData,
//           shopStatus: currentShopStatus,
//           shopOpenStatus: currentShopOpenStatus,
//           queueStatus: currentQueueStatus
//         } = await fetchOwnerDashboardData(user.id);
//         setShopName(name);
//         setShopStatus(currentShopStatus);
//         setShopOpenStatus(currentShopOpenStatus);
//         setQueueStatus(currentQueueStatus);
//         setLiveQueue(queueData);
//         setTodaySummary(summaryData);
//       } catch (error) {
//         setDashboardError(error.response?.data?.message || error.message || 'Unable to load dashboard data.');
//       } finally {
//         setRefreshing(false);
//       }
//     };
//     const toggleShop = async () => {
//       if (!user?.id || shopActionLoading) return;

//       try {
//         setShopActionLoading(true);
//         setDashboardError('');

//         // Get shop ID
//         const shopResponse = await api.get(`/shops/profile/${user.id}`);
//         const shopPayload = getPayload(shopResponse);
//         const shop = shopPayload?.shop ?? shopPayload;

//         const shopId = shop?.id ?? shop?._id;

//         if (!shopId) {
//           throw new Error('Shop ID was not found.');
//         }

//         const nextStatus =
//           shopOpenStatus === 'open' ? 'close' : 'open';

//         const response = await api.patch(
//           `/shops/${shopId}/shop-status`,
//           {
//             shopOpenStatus: nextStatus
//           }
//         );

//         const updatedShop =
//           response.data?.data ?? response.data;

//         // Update shop open status
//         setShopOpenStatus(
//           updatedShop?.shopOpenStatus ??
//           updatedShop?.shop_open_status ??
//           nextStatus
//         );

//         // IMPORTANT:
//         // Backend automatically pauses queue when shop is closed.
//         if (nextStatus === 'close') {
//           setQueueStatus('pause');
//         }

//       } catch (error) {
//         console.error('Toggle Shop Error:', error);

//         setDashboardError(
//           error.response?.data?.message ||
//           error.message ||
//           'Failed to change shop status.'
//         );
//       } finally {
//         setShopActionLoading(false);
//       }
//     };


//     const toggleQueue = async () => {
//       if (!user?.id || queueActionLoading) return;

//       // Queue start is only allowed when shop is active + open
//       if (
//         queueStatus !== 'start' &&
//         (shopStatus !== 'active' || shopOpenStatus !== 'open')
//       ) {
//         setDashboardError(
//           'Queue can only be started when the shop is active and open.'
//         );

//         return;
//       }

//       try {
//         setQueueActionLoading(true);
//         setDashboardError('');

//         // Get shop ID
//         const shopResponse = await api.get(`/shops/profile/${user.id}`);
//         const shopPayload = getPayload(shopResponse);
//         const shop = shopPayload?.shop ?? shopPayload;

//         const shopId = shop?.id ?? shop?._id;

//         if (!shopId) {
//           throw new Error('Shop ID was not found.');
//         }

//         const nextStatus =
//           queueStatus === 'start' ? 'pause' : 'start';

//         const response = await api.patch(
//           `/shops/${shopId}/queue-status`,
//           {
//             queueStatus: nextStatus
//           }
//         );

//         const updatedShop =
//           response.data?.data ?? response.data;

//         setQueueStatus(
//           updatedShop?.queueStatus ??
//           updatedShop?.queue_status ??
//           nextStatus
//         );

//       } catch (error) {
//         console.error('Toggle Queue Error:', error);

//         setDashboardError(
//           error.response?.data?.message ||
//           error.message ||
//           'Failed to change queue status.'
//         );
//       } finally {
//         setQueueActionLoading(false);
//       }
//     };

//     const handleForceLogout = (staffId) => {
//       if (window.confirm('Are you sure you want to force logout this staff member?')) {
//         setStaffStatus((prev) =>
//           prev.map((staff) => (staff.id === staffId ? { ...staff, is_logged_in: false } : staff))
//         );
//       }
//     };

//     const handleBroadcast = () => {
//       if (!message.trim()) return;
//       setSending(true);
//       setTimeout(() => {
//         setSending(false);
//         setMessage('');
//         alert('Message sent successfully!');
//       }, 500);
//     };

//     const onlineStaff = staffStatus.filter((staff) => staff.is_logged_in);

//     const currentHour = new Date().getHours();
//     const greeting = currentHour < 12 ? 'Good Morning' : currentHour < 17 ? 'Good Afternoon' : 'Good Evening';

//     return (
//       <div className="mx-auto w-full max-w-[1400px] p-4 md:p-6 text-slate-800 antialiased">
//         {/* PAGE HEADER */}
//         <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
//           <div>
//             <div className="text-xl font-bold text-slate-700">
//               {shopName}
//             </div>
//             <div className="text-sm font-medium text-slate-500">
//               {greeting}, {user.name}
//             </div>
//             {dashboardError && (
//               <div role="alert" className="mt-1 text-xs font-medium text-red-600">
//                 {dashboardError}
//               </div>
//             )}
//             {dashboardLoading && (
//               <div className="mt-1 text-xs text-slate-400">Loading shop dashboard...</div>
//             )}
//             <div className="mt-1 flex items-center gap-3 text-xs sm:text-sm">
//               <span className={`font-semibold ${isOpen ? 'text-emerald-600' : 'text-red-600'}`}>
//                 {isOpen ? '🟢 OPEN' : '🔴 CLOSED'}
//               </span>
//             </div>
//           </div>


//           <button
//             onClick={refreshDashboard}
//             disabled={refreshing}
//             className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
//           >
//             {refreshing ? (
//               <>
//                 <LoaderCircle className="h-4 w-4 animate-spin" />
//                 Refreshing...
//               </>
//             ) : (
//               <>
//                 <RefreshCw className="h-4 w-4" />
//                 Refresh
//               </>
//             )}
//           </button>

//         </div>

//         {/* SECTION FILTER BAR */}
//         <div className="mb-6 flex flex-wrap gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
//           {[
//             {
//               key: "all",
//               label: "All",
//               icon: HomeIcon,
//             },
//             {
//               key: "controls",
//               label: "Quick Controls",
//               icon: Settings2Icon,
//             },
//             {
//               key: "live",
//               label: "Live Queue",
//               icon: RadioIcon,
//             },
//             {
//               key: "summary",
//               label: "Today's Summary",
//               icon: BarChart3Icon,
//             },
//             // {
//             //   key: "message",
//             //   label: "Send Msg to Customers",
//             //   icon: MessageSquareIcon,
//             // },
//             // {
//             //   key: "staff",
//             //   label: "Staff Status",
//             //   icon: UsersIcon,
//             // },
//           ].map(({ key, label, icon: Icon }) => {
//             const active = activeSections.includes(key);

//             return (
//               <button
//                 key={key}
//                 onClick={() => handleSectionClick(key)}
//                 className={`flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-1.5 text-xs font-bold transition-all sm:text-sm ${active
//                   ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
//                   : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
//                   }`}
//               >
//                 <Icon size={16} strokeWidth={2.5} />
//                 <span>{label}</span>
//               </button>
//             );
//           })}
//         </div>

//         {/* QUICK CONTROLS */}
//         {isSectionActive('controls') && (
//           <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <h2 className="mb-4 text-base font-bold text-slate-900">Quick Controls</h2>
//             <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
//               <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-300">
//                 <div className="mb-2 flex items-center gap-2">
//                   <span className="text-xl">🏪</span>
//                   <span className="text-sm font-semibold text-slate-600">Shop Status</span>
//                 </div>
//                 <h3 className="text-xl font-extrabold text-slate-900">{isOpen ? 'OPEN' : 'CLOSED'}</h3>
//                 <p className="mb-4 text-xs text-slate-500">
//                   {isOpen ? 'Customers can visit your shop.' : 'Shop is closed.'}
//                 </p>
//                 <button
//                   onClick={toggleShop}
//                   className={`w-full rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition shadow-sm ${isOpen ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-slate-600 hover:bg-slate-700'
//                     }`}
//                 >
//                   {isOpen ? 'Close Shop' : 'Open Shop'}
//                 </button>
//               </div>

//               <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4 transition hover:border-slate-300">
//                 <div className="mb-2 flex items-center gap-2">
//                   <span className="text-xl">📋</span>
//                   <span className="text-sm font-semibold text-slate-600">Queue Status</span>
//                 </div>
//                 <h3 className="text-xl font-extrabold text-slate-900">{isActive ? 'ACTIVE' : 'PAUSED'}</h3>
//                 <p className="mb-4 text-xs text-slate-500">
//                   {isActive ? 'Customers can join queue.' : 'Queue is paused.'}
//                 </p>
//                 <button
//                   onClick={toggleQueue}
//                   className={`w-full rounded-lg px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white transition shadow-sm ${isActive ? 'bg-blue-600 hover:bg-blue-700' : 'bg-amber-500 hover:bg-amber-600'
//                     }`}
//                 >
//                   {isActive ? 'Pause Queue' : 'Resume Queue'}
//                 </button>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* LIVE QUEUE */}
//         {isSectionActive('live') && (
//           <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <h2 className="mb-4 text-base font-bold text-slate-900">Live Queue</h2>
//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//               {[
//                 { key: 'Q2', color: 'border-t-emerald-500' },
//                 { key: 'Q4', color: 'border-t-blue-500' },
//                 { key: 'Q6', color: 'border-t-amber-500' },
//                 { key: 'Q8', color: 'border-t-purple-500' }
//               ].map(({ key, color }) => (
//                 <div
//                   key={key}
//                   className={`relative rounded-xl border border-slate-200 border-t-4 bg-slate-50/50 p-4 text-center ${color}`}
//                 >
//                   <div className="text-xs font-bold uppercase tracking-wider text-slate-500">{key}</div>
//                   <div className="my-1 text-2xl font-black text-slate-900 sm:text-3xl">
//                     {liveQueue[key].waiting}
//                   </div>
//                   <div className="text-xs text-slate-400">Waiting: {liveQueue[key].waiting}</div>
//                 </div>
//               ))}
//             </div>
//           </section>
//         )}

//         {/* TODAY'S SUMMARY */}
//         {isSectionActive('summary') && (
//           <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//             <h2 className="mb-4 text-base font-bold text-slate-900">Today's Summary</h2>
//             <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
//               <div className="relative rounded-xl border border-slate-200 border-t-4 border-t-blue-500 bg-slate-50/50 p-4 text-center">
//                 <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Waiting</div>
//                 <div className="my-1 text-2xl font-black text-slate-900 sm:text-3xl">{todaySummary.waiting}</div>
//                 <div className="text-xs text-slate-400">Currently Waiting</div>
//               </div>

//               <div className="relative rounded-xl border border-slate-200 border-t-4 border-t-emerald-500 bg-slate-50/50 p-4 text-center">
//                 <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Arrived</div>
//                 <div className="my-1 text-2xl font-black text-slate-900 sm:text-3xl">{todaySummary.arrived}</div>
//                 <div className="text-xs text-slate-400">Customer Arrived</div>
//               </div>

//               <div className="relative rounded-xl border border-slate-200 border-t-4 border-t-amber-500 bg-slate-50/50 p-4 text-center">
//                 <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Not Arrived</div>
//                 <div className="my-1 text-2xl font-black text-slate-900 sm:text-3xl">{todaySummary.notArrived}</div>
//                 <div className="text-xs text-slate-400">Not Arrived</div>
//               </div>

//               <div className="relative rounded-xl border border-slate-200 border-t-4 border-t-red-500 bg-slate-50/50 p-4 text-center">
//                 <div className="text-xs font-bold uppercase tracking-wider text-slate-500">Cancelled</div>
//                 <div className="my-1 text-2xl font-black text-slate-900 sm:text-3xl">{todaySummary.cancelled}</div>
//                 <div className="text-xs text-slate-400">Cancelled Tokens</div>
//               </div>
//             </div>
//           </section>
//         )}

//         {/* BROADCAST MESSAGE */}
//         {/* {isSectionActive('message') && (
//         <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h2 className="mb-4 text-base font-bold text-slate-900">📢 Send Message to Customers</h2>
//           <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4">
//             <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
//               {[
//                 {
//                   icon: '⏳',
//                   title: 'Queue Delayed',
//                   desc: 'Inform customers about a delay',
//                   text: 'Queue is running a little late. Thank you for your patience.'
//                 },
//                 {
//                   icon: '🕐',
//                   title: 'Please Wait',
//                   desc: 'Let customers know to wait',
//                   text: 'Your table will be ready shortly. Please wait.'
//                 },
//                 {
//                   icon: '🍽️',
//                   title: 'Kitchen Busy',
//                   desc: 'Inform customers about service delay',
//                   text: 'Kitchen is busy. Service may take a few extra minutes.'
//                 },
//                 {
//                   icon: '✓',
//                   title: 'Thank You',
//                   desc: 'Send a friendly customer message',
//                   text: 'Thank you for visiting us. Enjoy your meal!'
//                 }
//               ].map(({ icon, title, desc, text }) => (
//                 <button
//                   key={title}
//                   type="button"
//                   onClick={() => setMessage(text)}
//                   className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3 text-left transition hover:border-amber-400 hover:bg-amber-50/30"
//                 >
//                   <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-100 text-lg text-orange-600">
//                     {icon}
//                   </span>
//                   <span className="min-w-0">
//                     <span className="block text-xs font-bold text-slate-900">{title}</span>
//                     <span className="block text-[11px] text-slate-500">{desc}</span>
//                   </span>
//                 </button>
//               ))}
//             </div>

//             <textarea
//               value={message}
//               onChange={(e) => setMessage(e.target.value)}
//               placeholder="Type your custom announcement..."
//               rows={3}
//               maxLength={150}
//               className="w-full rounded-xl border border-slate-200 p-3 text-xs outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 sm:text-sm"
//             />

//             <div className="mt-3 flex flex-col items-center justify-between gap-2 sm:flex-row">
//               <span className="text-xs text-slate-400">{message.length}/150</span>
//               <button
//                 onClick={handleBroadcast}
//                 disabled={sending || !message.trim()}
//                 className="w-full rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-50 sm:w-auto"
//               >
//                 {sending ? '⏳ Sending...' : '📤 Send Message'}
//               </button>
//             </div>
//           </div>
//         </section>
//       )} */}

//         {/* STAFF STATUS */}
//         {/* {isSectionActive('staff') && (
//         <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//           <h2 className="mb-4 text-base font-bold text-slate-900">👥 Staff Status</h2>

//           {onlineStaff.length === 0 ? (
//             <div className="py-8 text-center text-sm text-slate-500">No staff currently online</div>
//           ) : (
//             <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
//               {onlineStaff.map((staff) => (
//                 <div
//                   key={staff.id}
//                   className="relative rounded-xl border border-slate-200 border-l-4 border-l-emerald-500 bg-white p-4 shadow-sm"
//                 >
//                   <div className="mb-3 flex items-start justify-between gap-2">
//                     <div>
//                       <div className="text-sm font-bold text-slate-900">{staff.full_name}</div>
//                       <div className="text-xs text-slate-500 capitalize">
//                         {staff.role === 'counter' ? 'Counter Staff' : 'Serving Staff'}
//                       </div>
//                       <div className="text-[11px] text-slate-400">Staff ID: {staff.staff_id}</div>
//                     </div>

//                     <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
//                       <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
//                       Online
//                     </span>
//                   </div>

//                   <div className="mb-3 flex gap-2">
//                     <div className="flex-1 rounded-lg bg-slate-50 p-2 text-center">
//                       <span className="block text-[10px] text-slate-400">Logged in</span>
//                       <strong className="block text-xs text-slate-800">
//                         {staff.login_time
//                           ? new Date(staff.login_time).toLocaleTimeString([], {
//                             hour: '2-digit',
//                             minute: '2-digit'
//                           })
//                           : '--'}
//                       </strong>
//                     </div>

//                     {staff.role === 'staff' && (
//                       <div className="flex-1 rounded-lg bg-slate-50 p-2 text-center">
//                         <span className="block text-[10px] text-slate-400">Section</span>
//                         <span className="block text-xs font-bold uppercase text-slate-800">
//                           {staff.selected_section || '--'}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   <button
//                     type="button"
//                     onClick={() => handleForceLogout(staff.id)}
//                     className="w-full rounded-lg border border-red-200 bg-red-50 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition"
//                   >
//                     ⛔ Force Logout
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </section>
//       )} */}
//       </div>
//     );
//   }

import React, { useState, useEffect } from "react";
import useAuthStore from "../../store/auth.store";
import { socket } from "../../utils/socket";

const BASE_URL = import.meta.env.VITE_API_URL;

export default function StaffDashboard() {
  const { user, logout } = useAuthStore();
  const [staffProfile, setStaffProfile] = useState(null);
  const [shopProfile, setShopProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [updatingQueueStatus, setUpdatingQueueStatus] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // UI States for filtering queues and viewing data
  const [selectedQueues, setSelectedQueues] = useState(["ALL"]);
  const [waitingTokens, setWaitingTokens] = useState([]);
  const [pendingArrivals, setPendingArrivals] = useState([]);
  const [timerNow, setTimerNow] = useState(Date.now());
  const CALL_TIMEOUT_SECONDS = 120;

  const currentDate = new Date();
  const date = currentDate.toLocaleDateString();
  const time = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const queuesList = [
    { key: "Q2", name: "Queue 2 Persons", color: "orange" },
    { key: "Q4", name: "Queue 4 Persons", color: "emerald" },
    { key: "Q6", name: "Queue 6 Persons", color: "blue" },
    { key: "Q8", name: "Queue 8 Persons", color: "purple" },
  ];

  // Calculate dynamic waiting counts per queue
  const counts = queuesList.reduce((acc, q) => {
    acc[q.key] = waitingTokens.filter((t) => {
      const qType = (t.queue_type || t.queueType || "").toUpperCase();
      return qType === q.key;
    }).length;
    return acc;
  }, {});

  // Refresh the per-token countdown every second using the persisted calledAt timestamp.
  useEffect(() => {
    const hasActiveCountdown = pendingArrivals.some((token) => {
      const status = String(token.status || "").toLowerCase();
      if (status !== "called") return false;
      const calledAt = token.calledAt || token.called_at;
      const serverStart = calledAt ? Date.parse(calledAt) : NaN;
      const startedAt = Number(token._callStartedAt) || serverStart;
      return Number.isFinite(startedAt) &&
        startedAt > 0 &&
        Date.now() - startedAt < CALL_TIMEOUT_SECONDS * 1000;
    });

    if (!hasActiveCountdown) return;
    const interval = setInterval(() => setTimerNow(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [pendingArrivals]);

  const addCallTimer = (token) => {
    const existingStart = Number(token?._callStartedAt);
    const calledAt = token?.calledAt || token?.called_at;
    const serverStart = calledAt ? Date.parse(calledAt) : NaN;

    return {
      ...token,
      // Prefer the timestamp saved by the backend so refreshes never restart the timer.
      _callStartedAt:
        Number.isFinite(existingStart) && existingStart > 0
          ? existingStart
          : Number.isFinite(serverStart) && serverStart > 0
            ? serverStart
            : Date.now(),
    };
  };

  const toggleQueue = (queueKey) => {
    if (queueKey === "ALL") {
      setSelectedQueues(["ALL"]);
    } else {
      let updated = selectedQueues.filter((k) => k !== "ALL");
      if (updated.includes(queueKey)) {
        updated = updated.filter((k) => k !== queueKey);
      } else {
        updated.push(queueKey);
      }
      if (updated.length === 0) updated = ["ALL"];
      setSelectedQueues(updated);
    }
  };

  const isQueueVisible = (queueKey) => {
    return selectedQueues.includes("ALL") || selectedQueues.includes(queueKey);
  };

  // 1. Fetch staff profile and shop details on load with Bearer token
  useEffect(() => {
    const fetchStaffProfile = async () => {
      if (!user?.id) return;
      try {
        setLoadingProfile(true);
        const token = useAuthStore.getState().token || localStorage.getItem("accessToken");

        const res = await fetch(`${BASE_URL}/staff/${user.id}/profile`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });

        const result = await res.json();
        
        if (result.success && result.data) {
          setStaffProfile(result.data.user);
          setShopProfile(result.data.shop);
        }
      } catch (err) {
        console.error("Error fetching staff profile:", err);
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchStaffProfile();
  }, [user?.id]);

  // 2. Fetch initial waiting tokens once shopProfile is loaded
  useEffect(() => {
    const fetchInitialTokens = async () => {
      if (!shopProfile?.id) return;
      try {
        const token = useAuthStore.getState().token || localStorage.getItem("accessToken");
        const res = await fetch(`${BASE_URL}/tokens/waiting?shopId=${shopProfile.id}`, {
          headers: {
            "Authorization": `Bearer ${token}`,
          }
        });
        const data = await res.json();
        if (data.success && data.tokens) {
          const tokens = data.tokens;
          const waiting = tokens.filter((item) => String(item.status || "waiting").toLowerCase() === "waiting");
          const active = tokens
            .filter((item) => ["called", "imhere", "im-here"].includes(String(item.status || "").toLowerCase()))
            .map((item) => String(item.status || "").toLowerCase() === "called" ? addCallTimer(item) : item);

          setWaitingTokens(waiting);
          setPendingArrivals(active);
          setTimerNow(Date.now());
        }
      } catch (err) {
        console.error("Failed to load initial waiting tokens:", err);
      }
    };

    fetchInitialTokens();
  }, [shopProfile?.id]);

  // 3. Shared Socket.IO connection and shop-scoped live events.
  useEffect(() => {
    const shopId = shopProfile?.id ?? shopProfile?.shopId;
    if (shopId == null) return;

    const joinShop = () => {
      socket.emit("join-shop", { shopId: Number(shopId) });
    };

    const unwrapToken = (payload) => {
      const data = payload?.data ?? payload;
      return data?.token ?? data;
    };

    const handleNewToken = (payload) => {
      const token = unwrapToken(payload);
      if (Number(token?.shopId ?? token?.shop_id) !== Number(shopId)) return;
      if (token.status !== "waiting") return;

      setWaitingTokens((prev) => {
        if (prev.some((item) => String(item.id) === String(token.id))) return prev;
        return [...prev, token].sort(
          (a, b) => Number(a.tokenNo ?? a.token_no) - Number(b.tokenNo ?? b.token_no)
        );
      });
    };

    const handleTokenCancelled = (payload) => {
      const token = unwrapToken(payload);
      if (Number(token?.shopId ?? token?.shop_id) !== Number(shopId)) return;
      setWaitingTokens((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
      setPendingArrivals((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
    };

    const handleTokenCalled = (payload) => {
      const rawToken = unwrapToken(payload);
      if (Number(rawToken?.shopId ?? rawToken?.shop_id) !== Number(shopId)) return;
      const token = addCallTimer(rawToken);

      setWaitingTokens((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
      setPendingArrivals((prev) => {
        if (prev.some((item) => String(item.id) === String(token.id))) {
          return prev.map((item) =>
            String(item.id) === String(token.id)
              ? { ...item, ...token, _callStartedAt: item._callStartedAt || token._callStartedAt }
              : item
          );
        }
        return [...prev, token];
      });
      setTimerNow(Date.now());
    };

    const handleTokenImHere = (payload) => {
      const rawToken = unwrapToken(payload);
      if (Number(rawToken?.shopId ?? rawToken?.shop_id) !== Number(shopId)) return;
      const token = { ...rawToken, status: rawToken.status || "imhere" };

      setPendingArrivals((prev) => {
        if (prev.some((item) => String(item.id) === String(token.id))) {
          return prev.map((item) =>
            String(item.id) === String(token.id) ? { ...item, ...token } : item
          );
        }
        return [...prev, token];
      });
      // status becomes imhere, so the 2-minute countdown stops and the buttons appear.
    };

    const handleArrivalUpdated = (payload) => {
      const token = unwrapToken(payload);
      if (Number(token?.shopId ?? token?.shop_id) !== Number(shopId)) return;
      setPendingArrivals((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
      setWaitingTokens((prev) => prev.filter((item) => String(item.id) !== String(token.id)));
    };

    socket.on("connect", joinShop);
    socket.on("new_token_created", handleNewToken);
    socket.on("token_cancelled", handleTokenCancelled);
    socket.on("token_called", handleTokenCalled);
    socket.on("token_im_here", handleTokenImHere);
    socket.on("token_arrival_updated", handleArrivalUpdated);

    if (socket.connected) joinShop();

    return () => {
      socket.off("connect", joinShop);
      socket.off("new_token_created", handleNewToken);
      socket.off("token_cancelled", handleTokenCancelled);
      socket.off("token_called", handleTokenCalled);
      socket.off("token_im_here", handleTokenImHere);
      socket.off("token_arrival_updated", handleArrivalUpdated);
    };
  }, [shopProfile?.id, shopProfile?.shopId]);

  const handleCallNext = async (queueType) => {
    try {
      const token = useAuthStore.getState().token || localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/tokens/call-next?shopId=${shopProfile?.id ?? shopProfile?.shopId}&queueType=${encodeURIComponent(queueType)}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success) {
        const calledToken = addCallTimer(data.data);
        setTimerNow(Date.now());
        setPendingArrivals((prev) => {
          if (prev.some((t) => String(t.id) === String(calledToken.id))) {
            return prev.map((t) => String(t.id) === String(calledToken.id)
              ? { ...t, ...calledToken, _callStartedAt: t._callStartedAt || calledToken._callStartedAt }
              : t);
          }
          return [...prev, calledToken];
        });
        setWaitingTokens((prev) => prev.filter((t) => t.id !== calledToken.id));
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error calling next token:", err);
    }
  };

  const updateArrivalStatus = async (tokenId, status) => {
    try {
      const token = useAuthStore.getState().token || localStorage.getItem("accessToken");

      const res = await fetch(`${BASE_URL}/tokens/${tokenId}/arrival-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setPendingArrivals((prev) => prev.filter((t) => t.id !== tokenId));
      }
    } catch (err) {
      console.error("Error updating arrival status:", err);
    }
  };

  const getAuthToken = () =>
    useAuthStore.getState().token || localStorage.getItem("accessToken");

  const getShopId = () => shopProfile?.id ?? shopProfile?.shopId;

  // Logout is allowed only when the API confirms there are no waiting tokens.
  const handleLogout = async () => {
    if (loggingOut) return;

    const shopId = getShopId();
    if (!shopId) {
      alert("Shop information is not available. Please try again.");
      return;
    }

    setLoggingOut(true);
    try {
      const res = await fetch(
        `${BASE_URL}/tokens/waiting?shopId=${encodeURIComponent(shopId)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${getAuthToken()}`,
          },
        }
      );

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to verify the waiting queue.");
      }

      // Support APIs returning either { count } or { tokens: [] }.
      const waitingCount = Number.isFinite(Number(data?.count))
        ? Number(data.count)
        : Array.isArray(data?.tokens)
          ? data.tokens.filter(
              (item) => String(item.status || "waiting").toLowerCase() === "waiting"
            ).length
          : null;

      if (waitingCount === null) {
        throw new Error("Waiting queue count was not returned by the API.");
      }

      if (waitingCount !== 0) {
        alert(`Logout is not allowed. ${waitingCount} token(s) are still waiting in the queue.`);
        return;
      }

      logout();
    } catch (err) {
      console.error("Unable to verify waiting tokens before logout:", err);
      alert(err.message || "Unable to verify the waiting queue. Please try again.");
    } finally {
      setLoggingOut(false);
    }
  };

  // Toggle queue between start and pause using the shop-status API.
  const handleToggleQueueStatus = async () => {
    if (updatingQueueStatus) return;

    const shopId = getShopId();
    if (!shopId) {
      alert("Shop information is not available. Please try again.");
      return;
    }

    const currentStatus = String(
      shopProfile?.queueStatus ?? shopProfile?.queue_status ?? "start"
    ).toLowerCase();
    const nextStatus = currentStatus === "pause" || currentStatus === "paused"
      ? "start"
      : "pause";

    setUpdatingQueueStatus(true);
    try {
      const res = await fetch(`${BASE_URL}/shops/${shopId}/queue-status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getAuthToken()}`,
        },
        body: JSON.stringify({ queueStatus: nextStatus }),
      });

      const data = await res.json();
      if (!res.ok || data?.success === false) {
        throw new Error(data?.message || "Unable to update queue status.");
      }

      const returnedShop = data?.data?.shop ?? data?.shop ?? data?.data;
      const returnedStatus =
        returnedShop?.queueStatus ??
        returnedShop?.queue_status ??
        data?.queueStatus ??
        data?.queue_status ??
        nextStatus;

      setShopProfile((prev) => ({
        ...prev,
        ...(returnedShop && typeof returnedShop === "object" ? returnedShop : {}),
        queueStatus: returnedStatus,
        queue_status: returnedStatus,
      }));
      alert(`Queue ${String(returnedStatus).toLowerCase() === "pause" || String(returnedStatus).toLowerCase() === "paused" ? "paused" : "opened"} successfully.`);
    } catch (err) {
      console.error("Error updating queue status:", err);
      alert(err.message || "Unable to update queue status.");
    } finally {
      setUpdatingQueueStatus(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* HEADER */}
      <header className="w-full bg-white border-b border-slate-200 px-4 md:px-8 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 z-30 shadow-sm">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-extrabold tracking-wider mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            LIVE COUNTER SOCKET CONNECTED
          </div>
          <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 leading-tight">
            {shopProfile?.name || "Loading Shop..."}
          </h1>
          <p className="text-xs md:text-sm text-slate-500">
            Counter Staff: <strong className="text-slate-700">{staffProfile?.name || user?.name || "Staff"}</strong>
          </p>
        </div>

        <div className="flex items-center justify-between md:justify-end gap-6 border-t md:border-t-0 pt-3 md:pt-0 border-slate-100">
          <div className="flex flex-col items-start md:items-end text-xs text-slate-400">
            <span className="text-slate-600 font-semibold">{date} • {time}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleQueueStatus}
              disabled={updatingQueueStatus || loadingProfile}
              className={`h-10 px-4 border rounded-lg text-xs font-bold tracking-wide transition-colors duration-200 shadow-sm disabled:opacity-60 ${
                String(shopProfile?.queueStatus ?? shopProfile?.queue_status ?? "start").toLowerCase() === "pause" ||
                String(shopProfile?.queueStatus ?? shopProfile?.queue_status ?? "start").toLowerCase() === "paused"
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white"
                  : "border-amber-200 bg-white text-amber-700 hover:bg-amber-500 hover:text-white"
              }`}
            >
              {updatingQueueStatus
                ? "UPDATING..."
                : (String(shopProfile?.queueStatus ?? shopProfile?.queue_status ?? "start").toLowerCase() === "pause" ||
                   String(shopProfile?.queueStatus ?? shopProfile?.queue_status ?? "start").toLowerCase() === "paused")
                  ? "OPEN QUEUE"
                  : "PAUSE QUEUE"}
            </button>

            <button
              onClick={handleLogout}
              disabled={loggingOut || loadingProfile}
              className="h-10 px-5 border border-red-200 rounded-lg bg-white text-red-600 text-xs font-bold tracking-wide hover:bg-red-600 hover:text-white transition-colors duration-200 shadow-sm disabled:opacity-60"
            >
              {loggingOut ? "CHECKING..." : "LOGOUT"}
            </button>
          </div>
        </div>
      </header>

      {/* BODY LAYOUT: ASIDE + MAIN */}
      <div className="flex-1 flex flex-col md:flex-row">
        {/* ASIDE NAVIGATION */}
        <aside className="w-full md:w-56 bg-white border-b md:border-b-0 md:border-r border-slate-200 p-3 md:p-5 flex md:flex-col overflow-x-auto md:overflow-y-auto gap-2 md:gap-1 shrink-0">
          <div className="hidden md:block text-[11px] font-extrabold text-slate-400 tracking-wider uppercase px-3 mb-2">
            Queues Filter
          </div>

          <button
            onClick={() => toggleQueue("ALL")}
            className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
              selectedQueues.includes("ALL") ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-slate-500" />
            <span>ALL</span>
          </button>

          {queuesList.map((q) => (
            <button
              key={q.key}
              onClick={() => toggleQueue(q.key)}
              className={`flex-shrink-0 md:w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-bold transition-all ${
                selectedQueues.includes(q.key) ? "bg-blue-50 text-blue-600" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full bg-${q.color}-500`} />
              <span>{q.name}</span>
            </button>
          ))}
        </aside>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* Queue Sections List */}
          <div className="flex flex-col gap-6">
            {queuesList.map(
              (q) =>
                isQueueVisible(q.key) && (
                  <div key={q.key} className="w-full bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    {/* Queue Header & Call Next Button */}
                    <div className="p-4 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-black text-xs">
                          {q.key}
                        </div>
                        <div>
                          <h2 className="text-base font-bold text-slate-800">{q.name}</h2>
                          <p className="text-xs text-slate-400">Manage queue tokens</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="h-10 px-3 bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Waiting</span>
                          <strong className="text-lg font-black">{counts[q.key]}</strong>
                        </div>

                        <button
                          onClick={() => handleCallNext(q.key)}
                          className="h-10 px-5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-lg transition-all shadow-sm"
                        >
                          CALL NEXT 📢
                        </button>
                      </div>
                    </div>

                    {/* Waiting Tokens Grid */}
                    <div className="p-4 bg-slate-50/50 border-b border-slate-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-extrabold text-slate-400 tracking-wider uppercase">
                          Next in Line
                        </span>
                        <small className="text-[10px] text-slate-400">
                          {waitingTokens.filter((t) => {
                            const qType = (t.queue_type || t.queueType || "").toUpperCase();
                            return qType === q.key;
                          }).length} Remaining
                        </small>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                        {waitingTokens
                          .filter((t) => {
                            const qType = (t.queue_type || t.queueType || "").toUpperCase();
                            return qType === q.key;
                          })
                          .map((token) => (
                            <div key={token.id} className="min-w-0 border border-slate-200 rounded-lg bg-white p-3 text-xs shadow-2xs">
                              <div className="flex items-center justify-between gap-2">
                                <strong className="text-sm font-bold text-slate-800">
                                  Token #{token.token_no || token.tokenNo}
                                </strong>
                                <span className="rounded bg-emerald-50 px-2 py-1 text-[10px] font-bold uppercase text-emerald-700">
                                  {token.status || "waiting"}
                                </span>
                              </div>
                              <p className="mt-1 truncate font-semibold text-slate-700">
                                {token.customer_name || token.name}
                              </p>
                              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-500">
                                {(token.group_size != null || token.groupSize != null) && (
                                  <span>{token.group_size || token.groupSize} people</span>
                                )}
                              </div>
                            </div>
                          ))}

                        {waitingTokens.filter((t) => {
                          const qType = (t.queue_type || t.queueType || "").toUpperCase();
                          return qType === q.key;
                        }).length === 0 && (
                          <div className="col-span-full text-xs text-slate-400 italic py-2">No tokens waiting</div>
                        )}
                      </div>
                    </div>

                    {/* Pending Arrivals / Arrived / Not Arrived Section Scoped to this Queue */}
                    <div className="p-4">
                      <h3 className="text-xs font-extrabold text-slate-400 tracking-wider uppercase mb-3">
                        Currently Called / Pending Arrival
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingArrivals
                          .filter((t) => {
                            const qType = (t.queue_type || t.queueType || "").toUpperCase();
                            return qType === q.key;
                          })
                          .map((token) => {
                            const status = String(token.status || "").toLowerCase();
                            const isImHere = status === "imhere" || status === "im-here";
                            const isCalled = status === "called";
                            const customerConfirmed = token.customerConfirm === true || token.customer_confirm === true;
                            const callStartedAt = Number(token._callStartedAt) || Date.parse(token.calledAt || token.called_at || "");
                            const elapsedSeconds = callStartedAt ? Math.max(0, Math.floor((timerNow - callStartedAt) / 1000)) : 0;
                            const remainingSeconds = Math.max(0, CALL_TIMEOUT_SECONDS - elapsedSeconds);
                            const timerExpired = isCalled && remainingSeconds <= 0;
                            const canFinalize = isImHere || timerExpired;
                            return (
                              <div
                                key={token.id}
                                className={`p-3 border rounded-lg flex flex-col justify-between gap-3 shadow-2xs ${
                                  isImHere ? "border-emerald-300 bg-emerald-50/40" : "border-amber-200 bg-amber-50/30"
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="grid grid-cols-3 gap-2 text-xs flex-1">
                                    <div>
                                      <span className="block text-[10px] font-bold text-slate-400">TOKEN</span>
                                      <strong className={`${isCalled ? "text-2xl" : "text-base"} font-black text-blue-600`}>{token.token_no || token.tokenNo}</strong>
                                    </div>
                                    <div>
                                      <span className="block text-[10px] font-bold text-slate-400">CUSTOMER</span>
                                      <strong className="text-slate-700 truncate block">{token.customer_name || token.name}</strong>
                                    </div>
                                    <div>
                                      <span className="block text-[10px] font-bold text-slate-400">GROUP SIZE</span>
                                      <strong className="text-slate-700">{token.group_size ?? token.groupSize ?? "-"}</strong>
                                    </div>
                                  </div>
                                </div>

                                {canFinalize ? (
                                  <>
                                    <p className={`text-center text-sm font-extrabold ${isImHere && customerConfirmed ? "text-emerald-700" : "text-red-600"}`}>
                                      {isImHere
                                        ? (customerConfirmed ? "Customer Confirmed the Token" : "Customer is here")
                                        : "Customer Not Confirmed the Token"}
                                    </p>
                                    <div className="flex items-center gap-2 pt-2 border-t border-slate-200">
                                    <button
                                      onClick={() => updateArrivalStatus(token.id, "arrived")}
                                      className="flex-1 h-9 border border-emerald-400 bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 rounded-md text-xs font-bold transition-all shadow-xs"
                                    >
                                      ARRIVED ✅
                                    </button>

                                    <button
                                      onClick={() => updateArrivalStatus(token.id, "not_arrived")}
                                      className="flex-1 h-9 border border-red-300 bg-red-50 text-red-600 hover:bg-red-100 active:scale-95 rounded-md text-xs font-bold transition-all"
                                    >
                                      NOT ARRIVED ❌
                                    </button>
                                    </div>
                                  </>
                                ) : (
                                  <div className="pt-2 border-t border-slate-200 text-center">
                                    {isCalled ? (
                                      <div className="flex flex-col items-center gap-1">
                                        <span className="text-lg font-extrabold tabular-nums text-amber-800">
                                          {Math.floor(remainingSeconds / 60)}:{String(remainingSeconds % 60).padStart(2, "0")}
                                        </span>
                                        <span className="text-[11px] font-semibold text-amber-700">Time remaining</span>
                                      </div>
                                    ) : null}
                                  </div>
                                )}
                              </div>
                            );
                          })}

                        {pendingArrivals.filter((t) => {
                          const qType = (t.queue_type || t.queueType || "").toUpperCase();
                          return qType === q.key;
                        }).length === 0 && (
                          <div className="col-span-full p-4 border border-dashed border-slate-200 rounded-lg text-center text-xs text-slate-400">
                            No tokens called yet for this queue.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
            )}
          </div>
        </main>
      </div>
    </div>
  );
}