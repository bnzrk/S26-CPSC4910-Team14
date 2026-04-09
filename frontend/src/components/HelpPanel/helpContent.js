// Shape: { id: string, title: string, qa: Array<{ q: string, a: string }> }

export const DRIVER_TOPICS = [
  {
    id: 'what-is',
    title: 'What is DrivePoints?',
    qa: [
      {
        q: 'What is DrivePoints?',
        a: 'DrivePoints is a rewards program for professional truck drivers. Your sponsor company awards you points for safe, reliable driving — and you can spend those points on real products from your sponsor\'s rewards catalog.',
      },
      {
        q: 'Who runs the program?',
        a: 'Each trucking company (called a "sponsor") manages their own program — including which products are available and how points are awarded. DrivePoints is the platform that powers it all.',
      },
      {
        q: 'Do I need to pay anything to participate?',
        a: 'No. DrivePoints is completely free for drivers. You earn points through your driving, and spend them on rewards at no cost to you.',
      },
    ],
  },
  {
    id: 'earn',
    title: 'Earning Points',
    qa: [
      {
        q: 'How do I earn points?',
        a: 'Your sponsor awards points based on your driving performance. This may include factors like on-time deliveries, safe driving records, fuel efficiency, or other criteria your company tracks. Contact your sponsor or fleet manager to learn the specifics of your program.',
      },
      {
        q: 'Can my sponsor take away points?',
        a: 'Yes. Sponsors can add or deduct points and are required to give a reason for any change. You\'ll see a full history of every adjustment in your points history.',
      },
      {
        q: 'When do new points show up in my account?',
        a: 'Points appear in your account as soon as your sponsor posts them — there\'s no delay on our end. If you think points are missing, check your points history first, then reach out to your sponsor.',
      },
    ],
  },
  {
    id: 'balance',
    title: 'Checking Your Balance',
    qa: [
      {
        q: 'Where can I see my current point balance?',
        a: 'Your balance is displayed in the top navigation bar whenever you\'re logged in. You can also visit the Points page from your dashboard for a detailed breakdown.',
      },
      {
        q: 'Where can I see what changed my balance?',
        a: 'Go to Points in your sidebar to view a full history of every point addition, deduction, and purchase — including the reason provided by your sponsor.',
      },
      {
        q: 'I think my balance is wrong — what do I do?',
        a: 'Review your points history to see each transaction. If something looks incorrect, contact your sponsor or fleet manager directly, as they are responsible for managing your point balance.',
      },
    ],
  },
  {
    id: 'redeem',
    title: 'Redeeming Points',
    qa: [
      {
        q: 'How do I spend my points?',
        a: 'Browse the Catalog from your dashboard. Each item shows its price in points. When you find something you want, click it and place your order — your points are deducted immediately.',
      },
      {
        q: 'What kinds of rewards are available?',
        a: 'Your sponsor curates the catalog, so the selection varies by company. Products are sourced from a live marketplace and must be appropriate for all audiences. New items may be added regularly.',
      },
      {
        q: 'Can I cancel an order after placing it?',
        a: 'Orders are processed quickly, so cancellations may not always be possible. Check your order history for the current status. If you need help with an order, contact your sponsor.',
      },
      {
        q: 'How long does shipping take?',
        a: 'Shipping timelines depend on the item and the fulfillment source. Check your order details for estimated delivery information after placing an order.',
      },
    ],
  },
  {
    id: 'expiry',
    title: 'Point Expiration',
    qa: [
      {
        q: 'Do my points expire?',
        a: 'Point expiration is set by your sponsor company. Check with your sponsor to understand their specific expiration policy. Your points history will reflect any expiration adjustments.',
      },
      {
        q: 'Will I be notified before my points expire?',
        a: 'If your sponsor enables expiration alerts, you\'ll receive a notification before points are removed. Make sure your notification preferences are turned on in your profile settings.',
      },
    ],
  },
  {
    id: 'dispute',
    title: 'Missing or Wrong Points',
    qa: [
      {
        q: 'I expected points that never arrived — who do I contact?',
        a: 'Points are added by your sponsor, so your first step should be to reach out to your fleet manager or HR contact. They can verify whether points were posted or if there was an issue on their end.',
      },
      {
        q: 'A deduction looks wrong — what should I do?',
        a: 'Check your points history for the reason listed with the deduction. If the reason doesn\'t match your understanding, contact your sponsor to discuss it. All deductions require a reason to be on file.',
      },
    ],
  },
  {
    id: 'profile',
    title: 'Updating Your Profile',
    qa: [
      {
        q: 'How do I change my name or email?',
        a: 'Go to your Profile page (click your avatar in the top-right corner). From there you can update your personal details.',
      },
      {
        q: 'How do I change my password?',
        a: 'On the Profile page, look for the Change Password section. You\'ll need to enter your current password before setting a new one. Passwords must meet the complexity requirements shown on the page.',
      },
      {
        q: 'How do I manage my notification preferences?',
        a: 'Notification settings are in your Profile page under the Alerts section. You can choose which events trigger a notification — such as point changes or order confirmations.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy & Security',
    qa: [
      {
        q: 'Is my personal information secure?',
        a: 'Yes. Your password is encrypted and never stored in plain text. Sensitive data is encrypted at rest, and we use secure, parameterized database queries to prevent unauthorized access.',
      },
      {
        q: 'Who can see my account information?',
        a: 'Your sponsor can see your point balance, transaction history, and orders within their program. System administrators can access accounts for support and auditing purposes. Your password is never visible to anyone.',
      },
      {
        q: 'How do I reset my password if I forget it?',
        a: 'Use the "Forgot Password" link on the login page. You\'ll receive an email with instructions to reset your password securely.',
      },
    ],
  },
];

export const SPONSOR_TOPICS = [
  {
    id: 'what-is',
    title: 'What is DrivePoints?',
    qa: [
      {
        q: 'What is DrivePoints?',
        a: 'DrivePoints is a driver incentive platform for the trucking industry. As a sponsor, you manage a rewards program for your drivers — awarding points for good performance and letting them spend those points in a catalog you control.',
      },
      {
        q: 'What does a sponsor do?',
        a: 'Sponsors are responsible for managing their driver roster, setting point values, maintaining the rewards catalog, and awarding or adjusting points. You decide the rules of your program; DrivePoints handles the platform.',
      },
      {
        q: 'Can multiple people from my company use the same sponsor account?',
        a: 'Yes. You can have multiple sponsor users associated with your organization. Each user logs in with their own credentials and can manage drivers and the catalog.',
      },
    ],
  },
  {
    id: 'drivers',
    title: 'Managing Drivers',
    qa: [
      {
        q: 'How do drivers join my program?',
        a: 'Drivers apply to your organization through the DrivePoints platform. You\'ll receive an application that you can approve or reject. Once approved, they are affiliated with your organization and can earn and spend points.',
      },
      {
        q: 'How do I approve or reject a driver application?',
        a: 'Go to the Drivers section in your dashboard. Pending applications will appear there. Click an application to review the driver\'s details, then approve or reject with an optional reason.',
      },
      {
        q: 'Can I remove a driver from my program?',
        a: 'Yes. You can remove a driver from your program at any time from the Drivers page. The driver will be notified when they are removed.',
      },
      {
        q: 'Can I see a driver\'s full point history?',
        a: 'Yes. Click on any driver in your Drivers list to view their complete point history, including all additions, deductions, and purchases.',
      },
    ],
  },
  {
    id: 'catalog',
    title: 'Rewards Catalog',
    qa: [
      {
        q: 'How does the rewards catalog work?',
        a: 'Your catalog is sourced from a live product marketplace. You can add, remove, or feature products for your drivers. Pricing and availability update in real time. All products must be appropriate for general audiences.',
      },
      {
        q: 'How do I add products to my catalog?',
        a: 'Navigate to the Catalog section in your dashboard. You can search for products and add them to your catalog. Drivers will be able to see and purchase any active catalog items.',
      },
      {
        q: 'What happens if a product goes out of stock or is no longer available?',
        a: 'Since the catalog pulls from a live source, product availability updates automatically. Unavailable items will be marked as such, and drivers won\'t be able to purchase them until they\'re back in stock.',
      },
    ],
  },
  {
    id: 'points',
    title: 'Assigning Points',
    qa: [
      {
        q: 'How do I award points to a driver?',
        a: 'Go to a driver\'s profile from the Drivers section and use the Add Points form. You\'ll need to provide a reason for the award, which is recorded in the audit log.',
      },
      {
        q: 'Can I deduct points from a driver?',
        a: 'Yes. You can deduct points from a driver using the same interface as adding points, entering a negative amount or using the deduct option. A reason is required for all deductions.',
      },
      {
        q: 'What is the point-to-dollar conversion?',
        a: 'The default conversion rate is $0.01 per point. You can update this in your organization\'s settings. This rate is used to calculate the value of rewards in your catalog.',
      },
      {
        q: 'Is there an audit trail for point changes?',
        a: 'Yes. Every point addition or deduction is logged with the date, driver, amount, and reason. You can view this in the Reports section.',
      },
    ],
  },
  {
    id: 'reports',
    title: 'Reports & Analytics',
    qa: [
      {
        q: 'What reports are available to sponsors?',
        a: 'You can generate driver point tracking reports (filterable by driver and date range) and a full audit log restricted to your organization\'s drivers. Reports can be downloaded as CSV files.',
      },
      {
        q: 'How do I download a report?',
        a: 'In the Reports section, configure your filters (date range, driver, etc.) and click Generate. Once the report loads, a Download CSV button will appear.',
      },
      {
        q: 'Can I see which drivers are spending the most points?',
        a: 'Yes. The driver point tracking report shows point activity per driver. You can filter by date range to see spending patterns over time.',
      },
    ],
  },
  {
    id: 'settings',
    title: 'Account & Team Settings',
    qa: [
      {
        q: 'How do I update my organization\'s name or details?',
        a: 'Go to Settings in your sidebar. From there you can update your organization\'s profile information.',
      },
      {
        q: 'How do I change the point-to-dollar conversion rate?',
        a: 'The conversion rate is configurable in your organization\'s Settings page. Changes take effect immediately and apply to all future transactions.',
      },
      {
        q: 'How do I change my own password?',
        a: 'Visit your Profile page by clicking your avatar in the top navigation. You\'ll find a Change Password section there. Your current password is required to set a new one.',
      },
    ],
  },
  {
    id: 'fulfillment',
    title: 'Reward Fulfillment',
    qa: [
      {
        q: 'How are driver orders fulfilled?',
        a: 'When a driver places an order, it is processed through the product marketplace connected to your catalog. Fulfillment and shipping are handled through that source.',
      },
      {
        q: 'Can I see what drivers have ordered?',
        a: 'Yes. Driver orders are visible within each driver\'s profile and in your Reports section. You can track order status and history from there.',
      },
      {
        q: 'What if a driver has an issue with their order?',
        a: 'Coordinate directly with the driver and, if necessary, with the product source. You have the ability to adjust a driver\'s point balance to compensate for any fulfillment issues.',
      },
    ],
  },
  {
    id: 'support',
    title: 'Getting Support',
    qa: [
      {
        q: 'Who do I contact if something isn\'t working?',
        a: 'For platform issues, contact the DrivePoints system administrator through your company\'s designated support channel. For driver-related questions, you can manage most things directly from your dashboard.',
      },
      {
        q: 'What if a driver contacts me about a missing order or points dispute?',
        a: 'You have full access to a driver\'s point history and order history from their profile page. Review the records first, and use the point adjustment tools to resolve any discrepancies directly.',
      },
      {
        q: 'Can I impersonate a driver to see their view of the platform?',
        a: 'Yes. From a driver\'s profile, sponsor users can view the driver\'s perspective on the platform. This is useful for troubleshooting or helping drivers navigate the catalog.',
      },
    ],
  },
];
