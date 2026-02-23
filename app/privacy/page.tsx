import React from 'react';
import { NextPage } from 'next';

const PrivacyPage: NextPage = () => {
    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-2xl font-bold mb-4">Privacy Policy</h1>
            <p className="mb-2">Last updated: 2026-02-23</p>
            <h2 className="text-xl font-semibold mt-6">Introduction</h2>
            <p className="mb-4">This privacy policy explains how we collect, use, disclose, and safeguard your information when you visit our app. Please read this policy carefully. If you do not agree with the terms of this privacy policy, please do not access the application.</p>
            <h2 className="text-xl font-semibold mt-6">Information We Collect</h2>
            <p className="mb-4">We may collect information about you in a variety of ways, including:</p>
            <ul className="list-disc mb-4 pl-5">
                <li className="mb-2">Personal Data: Personally identifiable information such as your name, shipping address, email address, and telephone number that you voluntarily give when you register with the application.</li>
                <li className="mb-2">Derivative Data: Information our servers automatically collect when you access the application, such as your IP address, your browser type, your operating system, your access times, and the pages you have viewed directly before and after accessing the application.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-6">Use of Your Information</h2>
            <p className="mb-4">Having accurate information about you permits us to provide you with a smooth, efficient, and customized experience. Specifically, we may use information collected about you via the application to:</p>
            <ul className="list-disc mb-4 pl-5">
                <li className="mb-2">Create and manage your account.</li>
                <li className="mb-2">Email you regarding your account or order.</li>
                <li className="mb-2">Fulfill and manage purchases, orders, payments, and other transactions related to the application.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-6">Disclosure of Your Information</h2>
            <p className="mb-4">We may share information we have collected about you in certain situations. Your information may be disclosed as follows:</p>
            <ul className="list-disc mb-4 pl-5">
                <li className="mb-2">By Law or to Protect Rights: If we believe the release of information about you is necessary to respond to legal process, to investigate or remedy potential violations of our policies, or to protect the rights, property, and safety of others, we may share your information as permitted or required by any applicable law.</li>
            </ul>
            <h2 className="text-xl font-semibold mt-6">Contact Us</h2>
            <p className="mb-4">If you have questions or comments about this Privacy Policy, please contact us at:</p>
            <p className="mb-4">Email: support@example.com</p>
        </div>
    );
};

export default PrivacyPage;