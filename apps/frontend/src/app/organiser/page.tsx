"use client";

import { Suspense, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Building, Check, MailCheck, User2 } from "lucide-react";

const ImageCarousel = dynamic(() => import("./components/ImageCarousel"), {
  loading: () => (
    <div className="flex items-center justify-center h-full bg-gray-100">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
    </div>
  ),
  ssr: false,
});

const PersonalInfo = () => {
  const [sendotp, setsendotp] = useState(false);
  const [verify, setverify] = useState(false);

  return (
    <div className="bg-[#F8F6F3]">
      <h2 className="text-lg mb-2">Full Name *</h2>
      <input
        className="w-full border-none p-3 rounded-2xl mb-4 bg-white"
        placeholder="Enter your Full Name"
      />

      <h2 className="text-lg mb-2">Email Address *</h2>

      {!verify && (
        <input
          className="w-full border-none p-3 rounded-2xl mb-3 bg-white"
          placeholder="Enter your Company Email Address"
        />
      )}

      {verify && (
        <div className="w-full flex items-center justify-between bg-gray-200 rounded-2xl p-4 mb-4">
          <div className="flex items-center gap-3 text-gray-700">
            <span>
              <MailCheck />
            </span>
            <span>hmbn</span>
          </div>
          <span className="text-green-600 text-xl">✔</span>
        </div>
      )}

      {!sendotp && !verify && (
        <button
          onClick={() => setsendotp(true)}
          className="w-full bg-teal-500 rounded-2xl p-2 text-white"
        >
          Send OTP
        </button>
      )}

      {/* ✅ OTP SECTION */}
      {sendotp && !verify && (
        <div className="mt-4">
          <input
            type="text"
            placeholder="Enter the OTP"
            className="w-full bg-white rounded-2xl p-3"
          />

          <div className="w-full flex gap-3 mt-5">
            <button
              onClick={() => setverify(true)}
              className="flex-1 bg-teal-500 rounded-2xl p-2 text-white"
            >
              Verify OTP
            </button>

            <button className="flex-1 rounded-2xl bg-white p-2 border">
              Resend OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

const Contact = () => {
  const [sendotp, setsendotp] = useState(false);
  const [verify, setverify] = useState(false);
  return (
    <div>
      <div className="mb-5">
        <h2 className="text-2xl font-semibold">Contact Information</h2>
        <p className="text-gray-500 text-sm">
          Verify your phone number to continue
        </p>
      </div>
      <p>Contact Number *</p>
      <input
        className="w-full border-none bg-white p-2 rounded-2xl mb-3"
        placeholder="+91 9991119099"
      />
      {!sendotp && !verify && (
        <button
          onClick={() => setsendotp(true)}
          className="w-full bg-teal-500 rounded-2xl p-2 text-white"
        >
          Send OTP
        </button>
      )}

      {/* ✅ OTP SECTION */}
      {sendotp && !verify && (
        <div className="mt-2">
          <input
            type="text"
            placeholder="Enter the OTP"
            className="w-full bg-white rounded-2xl p-4"
          />

          <div className="w-full flex gap-3 mt-5">
            <button
              onClick={() => setverify(true)}
              className="flex-1 bg-teal-500 rounded-2xl p-2 text-white"
            >
              Verify OTP
            </button>

            <button className="flex-1 rounded-2xl bg-white p-2 border">
              Resend OTP
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
const UserType = () => {
  const [selected, setSelected] = useState(null);
  return (
    <div className="pb-5">
      <div className="mb-2 ">
        <h2 className="text-2xl font-semibold">Tell Us About Yourself</h2>
        <p className="text-sm text-gray-500">
          Are you booking as an individual or on behalf of an organization?
        </p>
      </div>
      <div className="w-full flex flex-col gap-5">
        {/* ✅ Cards */}
        {["independent", "organization"].map((type) => (
          <div
            key={type}
            onClick={() => setSelected(type)}
            className={`p-4 rounded-2xl cursor-pointer border transition-all
          ${
            selected === type
              ? "border-teal-600 bg-teal-50"
              : "border-gray-300 bg-white"
          }`}
          >
            <div className="flex items-center gap-4">
              {/* Icon */}
              <div
                className={`p-3 rounded-xl
              ${
                selected === type
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-600"
              }`}
              >
                {type === "independent" ? <User2 /> : <Building />}
              </div>

              {/* Text */}
              <div className="flex-1">
                <h3 className="text-lg font-medium">
                  {type === "independent"
                    ? "Independent Organizer"
                    : "Organization Member"}
                </h3>
                <p className="text-sm text-gray-600">
                  {type === "independent"
                    ? "I'm booking events or sessions independently"
                    : "I'm booking on behalf of a company or organization"}
                </p>
              </div>

              {selected === type && (
                <Check className="text-teal-700" size={22} />
              )}
            </div>
          </div>
        ))}

        {selected && (
          <div className="mt-3 p-4 space-y-1">
            <h4 className="font-medium text-gray-800">Your Designation/Role</h4>

            <input
              type="text"
              placeholder="e.g., HR Manager ,Event Coordinator etc "
              className="w-full p-3 bg-white rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export const Details = () => {
  const [orgType, setOrgType] = useState<string | null>(null);

  const orgOptions = [
    {
      id: "corporate",
      title: "Corporate",
      desc: "Enterprise or established company",
    },
    {
      id: "startup",
      title: "Startup",
      desc: "Early-stage or growth company",
    },
    {
      id: "accelerator",
      title: "Accelerator/Incubator",
      desc: "Supporting startups and entrepreneurs",
    },
  ];

  return (
    <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-2 pb-14">
      {/* ✅ HEADER */}
      <div>
        <h2 className="text-3xl font-semibold mb-1">Organization Details</h2>
        <p className="text-gray-500">Tell us about your organization</p>
      </div>

      {/* ✅ ORGANIZATION TYPE */}
      <div>
        <p className="text-sm font-medium mb-4">
          Organization Type <span className="text-red-500">*</span>
        </p>

        <div className="space-y-4">
          {orgOptions.map((item) => (
            <div
              key={item.id}
              onClick={() => setOrgType(item.id)}
              className={`p-5 rounded-2xl border cursor-pointer transition-all
                ${
                  orgType === item.id
                    ? "border-teal-600 bg-teal-50"
                    : "border-gray-300 bg-white"
                }`}
            >
              <h4 className="text-lg font-medium">{item.title}</h4>
              <p className="text-gray-500">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ✅ FORM (ALWAYS VISIBLE) */}
      <div className="space-y-6 bg-transparent">
        {/* Company Name */}
        <div>
          <label className="block text-sm mb-2">
            Company/Organization Name <span className="text-red-500">*</span>
          </label>
          <input
            placeholder="Enter organization name"
            className="w-full bg-white rounded-2xl p-4 border focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Industry */}
        <div>
          <label className="block text-sm mb-2">
            Industry <span className="text-red-500">*</span>
          </label>
          <div className="w-full bg-white rounded-2xl p-4 border text-gray-500">
            Select industry
          </div>
        </div>

        {/* Company Size */}
        <div>
          <label className="block text-sm mb-2">Company Size</label>
          <div className="w-full bg-white rounded-2xl p-4 border text-gray-500">
            Select company size
          </div>
        </div>

        {/* Website */}
        <div>
          <label className="block text-sm mb-2">Company Website</label>
          <input
            placeholder="https://www.example.com"
            className="w-full bg-white rounded-2xl p-4 border focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>

        {/* Country */}
        <div>
          <label className="block text-sm mb-2">Country</label>
          <div className="w-full bg-white rounded-2xl p-4 border text-gray-500">
            Select country
          </div>
        </div>

        {/* City */}
        <div>
          <label className="block text-sm mb-2">City</label>
          <input
            placeholder="Enter city"
            className="w-full bg-white rounded-2xl p-4 border focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
      </div>
    </div>
  );
};

const Select = ({
  label,
  placeholder,
}: {
  label: string;
  placeholder: string;
}) => (
  <div>
    <label className="block text-sm font-medium mb-2">{label}</label>
    <div className="w-full p-4 rounded-2xl border border-gray-200 text-gray-500 bg-white">
      {placeholder}
    </div>
  </div>
);

// ✅ STEPS DEFINITION (THIS WAS MISSING)
const steps = [
  {
    label: "Personal Info",
    component: <PersonalInfo />,
    subtitle: "Let's start with your basic information",
  },
  {
    label: "Contact",
    component: <Contact />,
    subtitle: "How can we reach you?",
  },
  {
    label: "User Type",
    component: <UserType />,
    subtitle: "Tell us who you are",
  },
  {
    label: "Details",
    component: <Details />,
    subtitle: "Almost done!",
  },
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const router = useRouter();

  const progress = (currentStep / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep === steps.length - 1) {
      // If on last step, navigate to subscription page
      router.push("/subscription");
    } else {
      // Otherwise, go to next step
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="h-screen flex overflow-hidden bg-[#F8F6F3]">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Suspense
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-100" />
          }
        >
          <ImageCarousel />
        </Suspense>
      </div>

      <div className="w-full lg:w-1/2 flex flex-col justify-center p-10 bg-[#F8F6F3]">
        {/* ✅ PROGRESS BAR */}
        <div className="mb-6">
          <div className="h-2 bg-gray-200 rounded-full">
            <div
              className="h-full bg-teal-600 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* ✅ STEP LABELS */}
          <div className="grid grid-cols-4 mt-3 text-sm text-gray-500">
            {steps.map((step, index) => (
              <p
                key={index}
                className={`text-center ${
                  currentStep === index ? "text-teal-600 font-medium" : ""
                }`}
              >
                {step.label}
              </p>
            ))}
          </div>
        </div>

        <h1 className="text-2xl font-semibold mb-1">Welcome to VoxVertex</h1>
        <p className="text-gray-600 mb-6">{steps[currentStep].subtitle}</p>

        {/* ✅ STEP CONTENT (THIS DIV CHANGES) */}
        <div className="p-6 rounded-lg min-h-[160px]">
          {steps[currentStep].component}
        </div>

        <div className="flex justify-between mt-8 bg-[#F8F6F3] p-2">
          <button
            onClick={() => setCurrentStep(currentStep - 1)}
            disabled={currentStep === 0}
            className="px-4 py-2 border-none rounded disabled:opacity-40 bg-white"
          >
            Back
          </button>

          <button
            onClick={handleNextStep}
            disabled={currentStep === steps.length - 1 && false}
            className="px-6 py-2 bg-teal-600 text-white rounded"
          >
            {currentStep === steps.length - 1 ? "Finish" : "Next Step"}
          </button>
        </div>
      </div>
    </div>
  );
}
