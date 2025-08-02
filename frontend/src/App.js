import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Textarea } from './components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { Badge } from './components/ui/badge';
import { SearchIcon, PlusIcon, HomeIcon, UserIcon, SettingsIcon, TrendingUpIcon } from 'lucide-react';
import './App.css';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_BACKEND_URL;

console.log('BACKEND_URL:', BACKEND_URL);
console.log('process.env:', process.env.REACT_APP_BACKEND_URL);
console.log('import.meta.env:', typeof window !== 'undefined' ? window.location.origin : 'server');

function App() {
  const [listings, setListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [regions, setRegions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedCondition, setSelectedCondition] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateListingOpen, setIsCreateListingOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [adminStats, setAdminStats] = useState({});
  const [payments, setPayments] = useState([]);
  const [users, setUsers] = useState([]);

  // Form states
  const [newListing, setNewListing] = useState({
    title: '',
    description: '',
    price: '',
    condition: 'new',
    category_id: '',
    region_id: '',
    contact_phone: '',
    contact_email: '',
    images: []
  });

  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    phone: '',
    region: ''
  });

  const [newCategory, setNewCategory] = useState({
    name: '',
    name_en: '',
    icon: ''
  });

  const [newRegion, setNewRegion] = useState({
    name: '',
    name_en: ''
  });

  useEffect(() => {
    fetchListings();
    fetchCategories();
    fetchRegions();
    // Set default admin user for demo
    setCurrentUser({
      id: 'admin',
      name: 'المدير',
      email: 'admin@souq.com',
      is_admin: true
    });
  }, []);

  const fetchListings = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedCategory) params.append('category_id', selectedCategory);
      if (selectedRegion) params.append('region_id', selectedRegion);
      if (selectedCondition) params.append('condition', selectedCondition);
      if (searchQuery) params.append('search', searchQuery);

      const response = await fetch(`${BACKEND_URL}/api/listings?${params}`);
      const data = await response.json();
      setListings(data.listings || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/categories`);
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/regions`);
      const data = await response.json();
      setRegions(data);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchAdminStats = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/admin/stats`);
      const data = await response.json();
      setAdminStats(data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    }
  };

  const fetchPayments = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/payments`);
      const data = await response.json();
      setPayments(data);
    } catch (error) {
      console.error('Error fetching payments:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`);
      const data = await response.json();
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchListings();
  }, [selectedCategory, selectedRegion, selectedCondition, searchQuery]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + newListing.images.length > 4) {
      alert('يمكن رفع 4 صور كحد أقصى');
      return;
    }
    setNewListing(prev => ({
      ...prev,
      images: [...prev.images, ...files]
    }));
  };

  const removeImage = (index) => {
    setNewListing(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleCreateListing = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newListing).forEach(key => {
        if (key === 'images') {
          newListing.images.forEach(image => {
            formData.append('images', image);
          });
        } else {
          formData.append(key, newListing[key]);
        }
      });
      formData.append('user_id', currentUser.id);

      const response = await fetch(`${BACKEND_URL}/api/listings`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setIsCreateListingOpen(false);
        setNewListing({
          title: '',
          description: '',
          price: '',
          condition: 'new',
          category_id: '',
          region_id: '',
          contact_phone: '',
          contact_email: '',
          images: []
        });
        fetchListings();
        alert('تم إنشاء الإعلان بنجاح! يرجى دفع رسوم الإعلان (2 ريال) لتفعيله.');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('حدث خطأ أثناء إنشاء الإعلان');
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newUser).forEach(key => {
        formData.append(key, newUser[key]);
      });

      const response = await fetch(`${BACKEND_URL}/api/users`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewUser({ name: '', email: '', phone: '', region: '' });
        fetchUsers();
        alert('تم إنشاء المستخدم بنجاح');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      alert('حدث خطأ أثناء إنشاء المستخدم');
    }
  };

  const handleCreateCategory = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newCategory).forEach(key => {
        formData.append(key, newCategory[key]);
      });

      const response = await fetch(`${BACKEND_URL}/api/categories`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewCategory({ name: '', name_en: '', icon: '' });
        fetchCategories();
        alert('تم إنشاء الفئة بنجاح');
      }
    } catch (error) {
      console.error('Error creating category:', error);
      alert('حدث خطأ أثناء إنشاء الفئة');
    }
  };

  const handleCreateRegion = async (e) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.keys(newRegion).forEach(key => {
        formData.append(key, newRegion[key]);
      });

      const response = await fetch(`${BACKEND_URL}/api/regions`, {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        setNewRegion({ name: '', name_en: '' });
        fetchRegions();
        alert('تم إنشاء المنطقة بنجاح');
      }
    } catch (error) {
      console.error('Error creating region:', error);
      alert('حدث خطأ أثناء إنشاء المنطقة');
    }
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    return category ? category.name : 'غير محدد';
  };

  const getRegionName = (regionId) => {
    const region = regions.find(r => r.id === regionId);
    return region ? region.name : 'غير محدد';
  };

  const openAdminPanel = () => {
    setIsAdminPanelOpen(true);
    fetchAdminStats();
    fetchPayments();
    fetchUsers();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <div className="flex-shrink-0">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  السوق المفتوح
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              <Dialog open={isCreateListingOpen} onOpenChange={setIsCreateListingOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                    <PlusIcon className="w-4 h-4 ml-2" />
                    إضافة إعلان
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>إضافة إعلان جديد</DialogTitle>
                    <DialogDescription>
                      أضف تفاصيل الإعلان الخاص بك. رسوم النشر 2 ريال.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleCreateListing} className="space-y-4">
                    <div>
                      <Input
                        placeholder="عنوان الإعلان"
                        value={newListing.title}
                        onChange={(e) => setNewListing(prev => ({ ...prev, title: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <Textarea
                        placeholder="وصف الإعلان"
                        value={newListing.description}
                        onChange={(e) => setNewListing(prev => ({ ...prev, description: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        type="number"
                        placeholder="السعر (ريال)"
                        value={newListing.price}
                        onChange={(e) => setNewListing(prev => ({ ...prev, price: e.target.value }))}
                        required
                      />
                      <Select value={newListing.condition} onValueChange={(value) => setNewListing(prev => ({ ...prev, condition: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="حالة المنتج" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">جديد</SelectItem>
                          <SelectItem value="used">مستعمل</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Select value={newListing.category_id} onValueChange={(value) => setNewListing(prev => ({ ...prev, category_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الفئة" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.icon} {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Select value={newListing.region_id} onValueChange={(value) => setNewListing(prev => ({ ...prev, region_id: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="اختر المنطقة" />
                        </SelectTrigger>
                        <SelectContent>
                          {regions.map(region => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="رقم الهاتف"
                        value={newListing.contact_phone}
                        onChange={(e) => setNewListing(prev => ({ ...prev, contact_phone: e.target.value }))}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={newListing.contact_email}
                        onChange={(e) => setNewListing(prev => ({ ...prev, contact_email: e.target.value }))}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        الصور (حتى 4 صور)
                      </label>
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                      />
                      {newListing.images.length > 0 && (
                        <div className="mt-4 grid grid-cols-2 gap-4">
                          {newListing.images.map((image, index) => (
                            <div key={index} className="relative">
                              <img
                                src={URL.createObjectURL(image)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-32 object-cover rounded-lg"
                              />
                              <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        إنشاء الإعلان
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {currentUser?.is_admin && (
                <Button onClick={openAdminPanel} variant="outline">
                  <SettingsIcon className="w-4 h-4 ml-2" />
                  لوحة التحكم
                </Button>
              )}
              
              <div className="flex items-center space-x-2 rtl:space-x-reverse">
                <UserIcon className="w-5 h-5" />
                <span className="text-sm font-medium">{currentUser?.name || 'زائر'}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            اعثر على كل ما تحتاجه
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            السوق المفتوح - المنصة الأولى للبيع والشراء في المملكة العربية السعودية
          </p>
          <div className="flex justify-center mb-12">
            <img 
              src="https://images.unsplash.com/photo-1532079563951-0c8a7dacddb3?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzd8MHwxfHNlYXJjaHwxfHxtYXJrZXRwbGFjZXxlbnwwfHx8fDE3NTQxNjc0NzR8MA&ixlib=rb-4.1.0&q=85"
              alt="السوق المفتوح"
              className="rounded-2xl shadow-2xl max-w-2xl w-full h-64 object-cover"
            />
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  placeholder="ابحث عن أي شيء..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع الفئات" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">جميع الفئات</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRegion} onValueChange={setSelectedRegion}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="جميع المناطق" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع المناطق</SelectItem>
                {regions.map(region => (
                  <SelectItem key={region.id} value={region.id}>
                    {region.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="الحالة" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">جميع الحالات</SelectItem>
                <SelectItem value="new">جديد</SelectItem>
                <SelectItem value="used">مستعمل</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>

      {/* Listings Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map(listing => (
              <Card key={listing.id} className="group hover:shadow-xl transition-shadow duration-300 border-0 shadow-lg">
                <CardHeader className="p-0">
                  {listing.images && listing.images[0] && (
                    <div className="relative overflow-hidden rounded-t-lg h-48">
                      <img
                        src={listing.images[0]}
                        alt={listing.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-4 right-4">
                        <Badge variant={listing.condition === 'new' ? 'default' : 'secondary'}>
                          {listing.condition === 'new' ? 'جديد' : 'مستعمل'}
                        </Badge>
                      </div>
                    </div>
                  )}
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
                    {listing.title}
                  </CardTitle>
                  <CardDescription className="text-sm mb-3 line-clamp-2">
                    {listing.description}
                  </CardDescription>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>{getCategoryName(listing.category_id)}</span>
                    <span>{getRegionName(listing.region_id)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold text-blue-600">
                      {listing.price} ريال
                    </span>
                    <span className="text-xs text-gray-500">
                      {listing.views_count} مشاهدة
                    </span>
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  <Button className="w-full" variant="outline">
                    عرض التفاصيل
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {listings.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 mb-4">
                <HomeIcon className="w-16 h-16 mx-auto" />
              </div>
              <p className="text-xl text-gray-600">لا توجد إعلانات متاحة</p>
              <p className="text-gray-500">جرب تغيير معايير البحث أو أضف إعلان جديد</p>
            </div>
          )}
        </div>
      </section>

      {/* Admin Panel Dialog */}
      <Dialog open={isAdminPanelOpen} onOpenChange={setIsAdminPanelOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>لوحة التحكم الإدارية</DialogTitle>
            <DialogDescription>
              إدارة النظام والمحتوى
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="stats" className="h-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="stats">الإحصائيات</TabsTrigger>
              <TabsTrigger value="categories">الفئات</TabsTrigger>
              <TabsTrigger value="regions">المناطق</TabsTrigger>
              <TabsTrigger value="users">المستخدمين</TabsTrigger>
              <TabsTrigger value="payments">المدفوعات</TabsTrigger>
            </TabsList>
            
            <div className="overflow-y-auto max-h-[60vh] mt-4">
              <TabsContent value="stats">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">إجمالي الإعلانات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{adminStats.total_listings || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">المستخدمين</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{adminStats.total_users || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">الفئات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{adminStats.total_categories || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">المناطق</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{adminStats.total_regions || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">مدفوعات معلقة</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-orange-600">{adminStats.pending_payments || 0}</div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{adminStats.total_revenue || 0} ريال</div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="categories">
                <div className="space-y-4">
                  <form onSubmit={handleCreateCategory} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">إضافة فئة جديدة</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        placeholder="الاسم بالعربية"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="الاسم بالإنجليزية"
                        value={newCategory.name_en}
                        onChange={(e) => setNewCategory(prev => ({ ...prev, name_en: e.target.value }))}
                        required
                      />
                      <div className="flex gap-2">
                        <Input
                          placeholder="أيقونة (مثل 🚗)"
                          value={newCategory.icon}
                          onChange={(e) => setNewCategory(prev => ({ ...prev, icon: e.target.value }))}
                          required
                        />
                        <Button type="submit">إضافة</Button>
                      </div>
                    </div>
                  </form>
                  <div className="space-y-2">
                    {categories.map(category => (
                      <div key={category.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">{category.icon}</span>
                          <div>
                            <p className="font-medium">{category.name}</p>
                            <p className="text-sm text-gray-500">{category.name_en}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="regions">
                <div className="space-y-4">
                  <form onSubmit={handleCreateRegion} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">إضافة منطقة جديدة</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <Input
                        placeholder="الاسم بالعربية"
                        value={newRegion.name}
                        onChange={(e) => setNewRegion(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="الاسم بالإنجليزية"
                        value={newRegion.name_en}
                        onChange={(e) => setNewRegion(prev => ({ ...prev, name_en: e.target.value }))}
                        required
                      />
                      <Button type="submit">إضافة</Button>
                    </div>
                  </form>
                  <div className="space-y-2">
                    {regions.map(region => (
                      <div key={region.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{region.name}</p>
                          <p className="text-sm text-gray-500">{region.name_en}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="users">
                <div className="space-y-4">
                  <form onSubmit={handleCreateUser} className="border rounded-lg p-4">
                    <h3 className="text-lg font-semibold mb-4">إضافة مستخدم جديد</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        placeholder="الاسم"
                        value={newUser.name}
                        onChange={(e) => setNewUser(prev => ({ ...prev, name: e.target.value }))}
                        required
                      />
                      <Input
                        type="email"
                        placeholder="البريد الإلكتروني"
                        value={newUser.email}
                        onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="رقم الهاتف"
                        value={newUser.phone}
                        onChange={(e) => setNewUser(prev => ({ ...prev, phone: e.target.value }))}
                        required
                      />
                      <Input
                        placeholder="المنطقة"
                        value={newUser.region}
                        onChange={(e) => setNewUser(prev => ({ ...prev, region: e.target.value }))}
                        required
                      />
                    </div>
                    <Button type="submit" className="mt-4">إضافة مستخدم</Button>
                  </form>
                  <div className="space-y-2">
                    {users.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email} • {user.phone}</p>
                          <p className="text-sm text-gray-500">{user.region}</p>
                        </div>
                        {user.is_admin && <Badge>مدير</Badge>}
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="payments">
                <div className="space-y-2">
                  {payments.map(payment => (
                    <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{payment.amount} ريال</p>
                        <p className="text-sm text-gray-500">
                          {payment.fee_type === 'listing_fee' ? 'رسوم إعلان' : 'عمولة بيع'}
                        </p>
                        <p className="text-sm text-gray-500">
                          طريقة الدفع: {payment.payment_method}
                        </p>
                      </div>
                      <Badge variant={payment.status === 'completed' ? 'default' : 'secondary'}>
                        {payment.status === 'completed' ? 'مكتمل' : 'معلق'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold mb-4">السوق المفتوح</h3>
              <p className="text-gray-400">
                منصة البيع والشراء الأولى في المملكة العربية السعودية
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">خدمات الدفع</h4>
              <ul className="space-y-2 text-gray-400">
                <li>تحويل بنكي</li>
                <li>STC Pay</li>
                <li>PayPal</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">الرسوم</h4>
              <ul className="space-y-2 text-gray-400">
                <li>2 ريال لكل إعلان</li>
                <li>3% عمولة عند البيع</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">تواصل معنا</h4>
              <ul className="space-y-2 text-gray-400">
                <li>support@souq.com</li>
                <li>+966 50 000 0000</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 السوق المفتوح. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;