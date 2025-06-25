import React, { useState } from "react";
import { X, ExternalLink, Star, Mail, TrendingUp, Heart, Users, Globe } from "lucide-react";
import { Spinner } from "../lib/Spinner";
const CompanyDetailsModal = ({ isOpen, onClose, company, companyData, emailData, emails, emailsLoading }) => {
  const [activeEmailIndex, setActiveEmailIndex] = useState(null);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className='w-4 h-4 fill-yellow-400 text-yellow-400' />);
    }

    if (hasHalfStar) {
      stars.push(
        <div key='half' className='relative w-4 h-4'>
          <Star className='w-4 h-4 text-gray-300 absolute' />
          <div className='overflow-hidden w-2'>
            <Star className='w-4 h-4 fill-yellow-400 text-yellow-400' />
          </div>
        </div>
      );
    }

    const remainingStars = 5 - Math.ceil(rating);
    for (let i = 0; i < remainingStars; i++) {
      stars.push(<Star key={`empty-${i}`} className='w-4 h-4 text-gray-300' />);
    }

    return stars;
  };

  const createMailtoLink = (emailData, address) => {
    const subject = encodeURIComponent(emailData.subject || "Default Subject");
    const body = encodeURIComponent(emailData.body || "Default Body");
    return `mailto:${address}?subject=${subject}&body=${body}`;
  };

  if (!isOpen) return null;

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4'>
      {/* Backdrop */}
      <div className='absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300' onClick={onClose} />

      {/* Modal */}
      <div className='relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden transform transition-all duration-300 scale-100'>
        {/* Header */}
        <div className='relative bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 p-6 text-white'>
          <button
            onClick={onClose}
            className='absolute z-10 top-2 right-2 p-2 rounded-full bg-red-600 hover:bg-red-500 transition-colors duration-200 backdrop-blur-sm'>
            <X className='w-5 h-5' />
          </button>

          <div className='flex items-end space-x-4'>
            <div className='w-16 h-16 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center overflow-hidden'>
              {company.logo ? (
                <img src={company.logo} alt={company.name} className='w-full h-full object-cover' />
              ) : (
                <Users className='w-8 h-8 text-white' />
              )}
            </div>

            <div className='flex-1'>
              <h2 className='text-2xl font-bold mb-2'>{company.name}</h2>
              <div className='flex items-center space-x-4 text-sm opacity-90'>
                <span className='flex items-center space-x-1'>
                  <Globe className='w-4 h-4' />
                </span>
                <span>{companyData ? companyData.size : "2-10 employees"}</span>
              </div>
            </div>

            <a
              href={company.website}
              target='_blank'
              rel='noopener noreferrer'
              className='flex items-center px-4 py-2 mr-3 bg-white/20 hover:bg-white/30 rounded-lg transition-colors duration-200 backdrop-blur-sm'>
              <ExternalLink className='w-4 h-4' />
              <span className='text-sm'>Visit Website</span>
            </a>
          </div>
        </div>

        {/* Content */}
        <div className='p-6 max-h-[60vh] overflow-y-auto'>
          {/* Rating Section */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
            <div className='bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-blue-700'>Overall Rating</span>
                <Star className='w-4 h-4 text-blue-600' />
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-2xl font-bold text-blue-900'>{companyData ? companyData.rating : "N/A"}</span>
                <div className='flex space-x-1'>{renderStars(companyData ? companyData.rating : "N/A")}</div>
              </div>
              <p className='text-xs text-blue-600 mt-1'>{companyData ? companyData.reviewCount.toLocaleString() : "0"} reviews</p>
            </div>

            <div className='bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-green-700'>Work-Life Balance</span>
                <Heart className='w-4 h-4 text-green-600' />
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-2xl font-bold text-green-900'>{companyData ? companyData.workLifeBalance : "N/A"}</span>
                <div className='flex space-x-1'>{renderStars(companyData ? companyData.workLifeBalance : 0)}</div>
              </div>
            </div>

            <div className='bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200'>
              <div className='flex items-center justify-between mb-2'>
                <span className='text-sm font-medium text-purple-700'>Career Growth</span>
                <TrendingUp className='w-4 h-4 text-purple-600' />
              </div>
              <div className='flex items-center space-x-2'>
                <span className='text-2xl font-bold text-purple-900'>{companyData ? companyData.careerGrowth : "Not Found"}</span>
                <div className='flex space-x-1'>{renderStars(companyData ? companyData.careerGrowth : 0)}</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className='mb-8'>
            <h3 className='text-lg font-semibold text-gray-800 mb-3'>About the Company</h3>
            <p className='text-gray-600 leading-relaxed'>{companyData ? companyData.description : "company description here"}</p>
          </div>

          {/* Contact Section */}
          <div>
            <h3 className='text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2'>
              <Mail className='w-5 h-5 text-blue-600' />
              <span>Contact Information</span>
            </h3>

            <div className='grid gap-3'>
              {emailsLoading && <Spinner />}
              {!emailsLoading && emails.length === 0 && <p className='text-gray-500'>No emails found for this company.</p>}
              {emails.map((email, index) => (
                <div key={index} className='group relative'>
                  <div className='flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all duration-200 border border-gray-200 hover:border-blue-300 hover:shadow-md'>
                    <div className='flex items-center space-x-3'>
                      <div className='w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center'>
                        <Mail className='w-5 h-5 text-white' />
                      </div>
                      <div>
                        <p className='text-sm text-gray-600'>{email}</p>
                      </div>
                    </div>

                    <div className='flex items-center space-x-2'>
                      <button
                        onClick={() => setActiveEmailIndex(activeEmailIndex === index ? null : index)}
                        className='px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-full transition-colors duration-200'>
                        {activeEmailIndex === index ? "Hide Preview" : "Preview"}
                      </button>
                      <a
                        href={createMailtoLink(emailData, email)}
                        className='px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl'>
                        Send Email
                      </a>
                    </div>
                  </div>

                  {/* Email Preview */}
                  {activeEmailIndex === index && (
                    <div className='mt-2 p-4 bg-white border border-gray-200 rounded-lg shadow-sm animate-in slide-in-from-top-2 duration-200'>
                      <div className='text-sm space-y-2'>
                        <div>
                          <span className='font-medium text-gray-700'>Subject: </span>
                          <span className='text-gray-600'>{emailData ? emailData.subject : "email subject"}</span>
                        </div>
                        <div>
                          <span className='font-medium text-gray-700'>Body:</span>
                          <pre className='mt-1 text-gray-600 whitespace-pre-wrap font-sans'>
                            {emailData ? emailData.body : "email body here"}
                          </pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default CompanyDetailsModal;
