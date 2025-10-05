import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Hospital, 
  User, 
  Shield, 
  Stethoscope, 
  ArrowRight,
  Activity,
  Clock,
  Users,
  CheckCircle,
  Calendar,
  FileText,
  Phone,
  ChevronRight,
  Heart,
  Sparkles
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

const MainApp: React.FC = () => {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const quickStats = [
    { icon: Clock, label: '24/7 Support', value: 'Always Available' },
    { icon: Users, label: 'Active Users', value: '10,000+' },
    { icon: Hospital, label: 'Partner Hospitals', value: '500+' },
    { icon: Activity, label: 'Daily Appointments', value: '1,000+' }
  ];

  const portalConfig = {
    patient: {
      icon: User,
      title: 'Patient Portal',
      description: 'Access your medical records, book appointments, and manage your healthcare',
      benefits: [
        'Instant appointment booking',
        'Digital health records',
        'Prescription management',
        'Emergency support'
      ],
      actions: [
        { 
          primary: true,
          title: 'Sign In',
          subtitle: 'Access your account',
          path: '/patient-auth',
          icon: ArrowRight
        },
        {
          primary: false,
          title: 'Register',
          subtitle: 'Create new account',
          path: '/patient-auth',
          icon: User
        }
      ],
      quickLink: {
        text: 'Book Appointment Without Login',
        path: '/',
        icon: Calendar
      }
    },
    hospital: {
      icon: Hospital,
      title: 'Hospital Portal',
      description: 'Manage your hospital, doctors, and patient bookings',
      benefits: [
        'Staff management system',
        'Patient analytics dashboard',
        'Appointment scheduling',
        'Resource allocation'
      ],
      actions: [
        {
          primary: true,
          title: 'Hospital Login',
          subtitle: 'Access dashboard',
          path: '/hospital-login',
          icon: ArrowRight
        },
        {
          primary: false,
          title: 'Apply Now',
          subtitle: 'Register hospital',
          path: '/hospital-application',
          icon: Hospital
        }
      ]
    },
    // staff: {
    //   icon: Stethoscope,
    //   title: 'Staff Portal',
    //   description: 'Access staff dashboard for medical professionals',
    //   benefits: [
    //     'Patient management',
    //     'Schedule optimization',
    //     'Medical records access',
    //     'Team collaboration'
    //   ],
    //   actions: [
    //     {
    //       primary: true,
    //       title: 'Staff Login',
    //       subtitle: 'Access your workspace',
    //       path: '/staff-auth',
    //       icon: ArrowRight
    //     },
    //     {
    //       primary: false,
    //       title: 'Join as Staff',
    //       subtitle: 'Register account',
    //       path: '/staff-auth',
    //       icon: Stethoscope
    //     }
    //   ]
    // },
    admin: {
      icon: Shield,
      title: 'Admin Portal',
      description: 'Manage hospitals, approve applications, and oversee the platform',
      benefits: [
        'Platform analytics',
        'User management',
        'Hospital approvals',
        'System monitoring'
      ],
      actions: [
        {
          primary: true,
          title: 'Admin Dashboard',
          subtitle: 'Full control access',
          path: '/admin-login',
          icon: ArrowRight,
          fullWidth: true
        }
      ],
      // credentials: {
      //   email: 'admin@medconnect.com',
      //   password: 'admin123'
      // }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Enhanced Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-white/30 backdrop-blur-sm" />
        <div className="relative container mx-auto px-4 py-16 lg:py-20">
          {/* Logo and Title Section */}
          <div className="text-center space-y-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-sm border border-blue-200 shadow-sm">
              <Heart className="w-4 h-4 text-red-500 animate-pulse" />
              <span className="text-sm font-semibold text-blue-900">Your Health, Our Priority</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold">
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                MedConnect
              </span>
              <span className="block text-3xl lg:text-4xl mt-2 text-gray-800 font-normal">
                Healthcare Platform
              </span>
            </h1>
            
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Connecting patients, hospitals, and healthcare providers for better healthcare delivery
            </p>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-12 max-w-5xl mx-auto">
            {quickStats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/70 backdrop-blur-sm rounded-2xl p-4 lg:p-5 border border-white/50 shadow-sm hover:shadow-md transition-all duration-300 hover:bg-white/90"
              >
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <stat.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600 mt-1">{stat.label}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modern Tabs Section */}
      <div className="container mx-auto px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="patient" className="space-y-8">
            {/* Modern Tab Navigation */}
            <TabsList className="grid grid-cols-2 lg:grid-cols-4 gap-2 h-auto p-2 bg-white/50 backdrop-blur-sm border border-white/50 shadow-lg">
              {Object.entries(portalConfig).map(([key, config]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                  className="flex flex-col lg:flex-row items-center gap-2 py-4 px-3 data-[state=active]:bg-white data-[state=active]:shadow-md rounded-xl transition-all duration-200"
                >
                  <config.icon className="w-5 h-5" />
                  <span className="text-sm lg:text-base font-medium">
                    {config.title.split(' ')[0]}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>

            {/* Tab Content with Modern Cards */}
            {Object.entries(portalConfig).map(([key, config]) => (
              <TabsContent key={key} value={key} className="space-y-6 mt-8">
                <div className="grid lg:grid-cols-3 gap-6">
                  {/* Main Action Card */}
                  <Card 
                    className="lg:col-span-2 border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden"
                    onMouseEnter={() => setHoveredCard(key)}
                    onMouseLeave={() => setHoveredCard(null)}
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full -mr-16 -mt-16 opacity-50" />
                    
                    <CardHeader className="relative">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl">
                          <config.icon className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="text-2xl">{config.title}</CardTitle>
                          <CardDescription className="text-base mt-1">
                            {config.description}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-6">
                      {/* Action Buttons Grid */}
                      <div className={cn(
                        "grid gap-4",
                        config.actions.length === 1 ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"
                      )}>
                        {config.actions.map((action, idx) => (
                          <Button
                            key={idx}
                            onClick={() => navigate(action.path)}
                            variant={action.primary ? "default" : "outline"}
                            className={cn(
                              "h-auto p-6 group relative overflow-hidden transition-all duration-300",
                              action.fullWidth && "sm:col-span-2",
                              action.primary 
                                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl" 
                                : "hover:bg-blue-50 border-2"
                            )}
                          >
                            <div className="flex items-center justify-between w-full">
                              <div className="text-left">
                                <div className="font-semibold text-lg">{action.title}</div>
                                <div className={cn(
                                  "text-sm mt-1",
                                  action.primary ? "text-blue-100" : "text-gray-600"
                                )}>
                                  {action.subtitle}
                                </div>
                              </div>
                              <action.icon className={cn(
                                "w-6 h-6 transition-transform group-hover:translate-x-1",
                                action.primary ? "text-white" : "text-blue-600"
                              )} />
                            </div>
                          </Button>
                        ))}
                      </div>

                      {/* Quick Link */}
                      {'quickLink' in config && config.quickLink && (
                        <div className="pt-4 border-t border-gray-100">
                          <Button
                            variant="link"
                            onClick={() => navigate(config.quickLink.path)}
                            className="text-blue-600 hover:text-blue-700 p-0 font-medium group"
                          >
                            <config.quickLink.icon className="w-4 h-4 mr-2" />
                            {config.quickLink.text}
                            <ChevronRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                          </Button>
                        </div>
                      )}

                      {/* Admin Credentials */}
                      {/* {'credentials' in config && config.credentials && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 border border-blue-100">
                          <p className="text-sm font-semibold text-gray-700 mb-3">Demo Credentials</p>
                          <div className="space-y-2 font-mono text-sm bg-white rounded-lg p-3">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Email:</span>
                              <span className="text-gray-900">{config.credentials.email}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Password:</span>
                              <span className="text-gray-900">{config.credentials.password}</span>
                            </div>
                          </div>
                          <a 
                            href="/admin-setup" 
                            className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 mt-3 font-medium"
                          >
                            First time? Setup Admin Account
                            <ChevronRight className="w-3 h-3" />
                          </a>
                        </div>
                      )} */}
                    </CardContent>
                  </Card>

                  {/* Benefits Card */}
                  <Card className="border-0 shadow-xl bg-gradient-to-br from-blue-50 to-indigo-50">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-yellow-500" />
                        Key Features
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-3">
                        {config.benefits.map((benefit, idx) => (
                          <li key={idx} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm text-gray-700">{benefit}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            ))}
          </Tabs>

          {/* About Section - Modern Cards Grid */}
          <div className="mt-20">
            <Card className="border-0 shadow-xl bg-white/95 backdrop-blur-sm overflow-hidden">
              <CardHeader className="text-center bg-gradient-to-r from-blue-50 to-indigo-50 py-8">
                <CardTitle className="text-3xl">Why Choose MedConnect?</CardTitle>
                <CardDescription className="text-lg mt-2">
                  Your comprehensive healthcare management solution
                </CardDescription>
              </CardHeader>
              <CardContent className="p-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    { icon: User, title: 'For Patients', desc: 'Book appointments, manage records, emergency services', color: 'blue' },
                    { icon: Hospital, title: 'For Hospitals', desc: 'Manage doctors, bookings, patient care', color: 'green' },
                    { icon: Shield, title: 'For Admin', desc: 'Oversee platform, approve hospitals, analytics', color: 'purple' }
                  ].map((item, idx) => (
                    <div 
                      key={idx}
                      className="group hover:scale-105 transition-all duration-300"
                    >
                      <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-lg h-full">
                        <div className={`inline-flex p-4 rounded-2xl bg-${item.color}-100 mb-4`}>
                          <item.icon className={`w-8 h-8 text-${item.color}-600`} />
                        </div>
                        <h4 className="font-bold text-lg text-gray-900 mb-2">{item.title}</h4>
                        <p className="text-sm text-gray-600">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MainApp;