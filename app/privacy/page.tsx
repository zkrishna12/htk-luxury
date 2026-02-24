import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4">
      <h1 className="text-3xl font-bold my-6">Privacy Policy</h1>
      <nav className="my-4">
        <h2 className="font-semibold">Table of Contents:</h2>
        <ul className="list-disc pl-5">
          <li><a href="#section1" className="text-blue-500 hover:underline">1. Introduction</a></li>
          <li><a href="#section2" className="text-blue-500 hover:underline">2. Information We Collect</a></li>
          <li><a href="#section3" className="text-blue-500 hover:underline">3. How We Use Your Information</a></li>
          <li><a href="#section4" className="text-blue-500 hover:underline">4. Cookies and Tracking Technologies</a></li>
          <li><a href="#section5" className="text-blue-500 hover:underline">5. Data Sharing and Disclosure</a></li>
          <li><a href="#section6" className="text-blue-500 hover:underline">6. Data Security</a></li>
          <li><a href="#section7" className="text-blue-500 hover:underline">7. Your Rights</a></li>
          <li><a href="#section8" className="text-blue-500 hover:underline">8. Third-Party Services</a></li>
          <li><a href="#section9" className="text-blue-500 hover:underline">9. Children's Privacy</a></li>
          <li><a href="#section10" className="text-blue-500 hover:underline">10. Changes to This Privacy Policy</a></li>
          <li><a href="#section11" className="text-blue-500 hover:underline">11. Contact Us</a></li>
        </ul>
      </nav>
      <section id="section1" className="my-4">
        <h2 className="text-xl font-semibold">1. Introduction</h2>
        <p>HTK Enterprises values your privacy. This Privacy Policy outlines how we collect, use, disclose, and protect your information.</p>
      </section>
      <section id="section2" className="my-4">
        <h2 className="text-xl font-semibold">2. Information We Collect</h2>
        <p>We may collect personal identification information from you in a variety of ways, including but not limited to your name, email address, and phone number.</p>
      </section>
      <section id="section3" className="my-4">
        <h2 className="text-xl font-semibold">3. How We Use Your Information</h2>
        <p>Your information helps us improve our services and communication with you. We may use your information for processing transactions, sending periodic emails, and improving customer service.</p>
      </section>
      <section id="section4" className="my-4">
        <h2 className="text-xl font-semibold">4. Cookies and Tracking Technologies</h2>
        <p>We use cookies and similar tracking technologies to enhance your experience on our site.</p>
      </section>
      <section id="section5" className="my-4">
        <h2 className="text-xl font-semibold">5. Data Sharing and Disclosure</h2>
        <p>We do not sell, trade, or otherwise transfer your personal identification information to outside parties without your consent.</p>
      </section>
      <section id="section6" className="my-4">
        <h2 className="text-xl font-semibold">6. Data Security</h2>
        <p>Your data security is important to us. We implement a variety of security measures to maintain the safety of your personal information.</p>
      </section>
      <section id="section7" className="my-4">
        <h2 className="text-xl font-semibold">7. Your Rights</h2>
        <p>You have the right to request access to the personal data we hold about you and to request corrections if any information is inaccurate.</p>
      </section>
      <section id="section8" className="my-4">
        <h2 className="text-xl font-semibold">8. Third-Party Services</h2>
        <p>Our website may contain links to third-party sites. We are not responsible for the privacy practices of these sites.</p>
      </section>
      <section id="section9" className="my-4">
        <h2 className="text-xl font-semibold">9. Children's Privacy</h2>
        <p>Our services are not directed to children under the age of 13. We do not knowingly collect personal data from children.</p>
      </section>
      <section id="section10" className="my-4">
        <h2 className="text-xl font-semibold">10. Changes to This Privacy Policy</h2>
        <p>We may update this Privacy Policy periodically to reflect changes in our practices.</p>
      </section>
      <section id="section11" className="my-4">
        <h2 className="text-xl font-semibold">11. Contact Us</h2>
        <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
        <p>Email: <a href="mailto:support@htkenterprises.net" className="text-blue-500 hover:underline">support@htkenterprises.net</a></p>
        <p>Address: 13-01-33B Samykannu Street, Alagarnayakkanpatti, Sithayankottai 624708</p>
        <p>Phone: <a href="tel:8438380900" className="text-blue-500 hover:underline">8438380900</a></p>
      </section>
    </div>
  );
};

export default PrivacyPolicy;