#!/usr/bin/env python3
"""
Backend API Testing for السوق المفتوح (Open Market)
Tests all API endpoints including categories, regions, listings, users, and admin functionality
"""

import requests
import sys
import json
import io
from datetime import datetime

class MarketplaceAPITester:
    def __init__(self, base_url="https://344fe52c-255d-4d9e-8009-672639ed604c.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_resources = {
            'users': [],
            'categories': [],
            'regions': [],
            'listings': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Accept': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, timeout=10)
                else:
                    response = requests.post(url, data=data, headers=headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers, timeout=10)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    if isinstance(response_data, dict) and 'id' in response_data:
                        print(f"   Created resource ID: {response_data['id']}")
                    return True, response_data
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Response text: {response.text[:200]}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_health_check(self):
        """Test health endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_get_categories(self):
        """Test getting categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET", 
            "api/categories",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} categories")
            if len(response) > 0:
                print(f"   Sample category: {response[0].get('name', 'N/A')}")
        return success, response

    def test_get_regions(self):
        """Test getting regions"""
        success, response = self.run_test(
            "Get Regions",
            "GET",
            "api/regions", 
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} regions")
            if len(response) > 0:
                print(f"   Sample region: {response[0].get('name', 'N/A')}")
        return success, response

    def test_create_user(self):
        """Test creating a new user"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            'name': f'مستخدم تجريبي {timestamp}',
            'email': f'test_user_{timestamp}@example.com',
            'phone': f'+966500{timestamp}',
            'region': 'الرياض'
        }
        
        success, response = self.run_test(
            "Create User",
            "POST",
            "api/users",
            200,
            data=user_data
        )
        
        if success and 'id' in response:
            self.created_resources['users'].append(response['id'])
            
        return success, response

    def test_get_users(self):
        """Test getting all users"""
        success, response = self.run_test(
            "Get Users",
            "GET",
            "api/users",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} users")
        return success, response

    def test_create_category(self):
        """Test creating a new category"""
        timestamp = datetime.now().strftime('%H%M%S')
        category_data = {
            'name': f'فئة تجريبية {timestamp}',
            'name_en': f'Test Category {timestamp}',
            'icon': '🧪'
        }
        
        success, response = self.run_test(
            "Create Category",
            "POST",
            "api/categories",
            200,
            data=category_data
        )
        
        if success and 'id' in response:
            self.created_resources['categories'].append(response['id'])
            
        return success, response

    def test_create_region(self):
        """Test creating a new region"""
        timestamp = datetime.now().strftime('%H%M%S')
        region_data = {
            'name': f'منطقة تجريبية {timestamp}',
            'name_en': f'Test Region {timestamp}'
        }
        
        success, response = self.run_test(
            "Create Region",
            "POST",
            "api/regions",
            200,
            data=region_data
        )
        
        if success and 'id' in response:
            self.created_resources['regions'].append(response['id'])
            
        return success, response

    def test_create_listing_with_images(self, categories, regions, users):
        """Test creating a listing with image upload"""
        if not categories or not regions or not users:
            print("❌ Cannot test listing creation - missing required data")
            return False, {}
            
        # Create a simple test image
        test_image_content = b'\x89PNG\r\n\x1a\n\x00\x00\x00\rIHDR\x00\x00\x00\x01\x00\x00\x00\x01\x08\x02\x00\x00\x00\x90wS\xde\x00\x00\x00\tpHYs\x00\x00\x0b\x13\x00\x00\x0b\x13\x01\x00\x9a\x9c\x18\x00\x00\x00\nIDATx\x9cc\xf8\x00\x00\x00\x01\x00\x01\x00\x00\x00\x00IEND\xaeB`\x82'
        
        timestamp = datetime.now().strftime('%H%M%S')
        listing_data = {
            'title': f'إعلان تجريبي {timestamp}',
            'description': f'وصف الإعلان التجريبي {timestamp}',
            'price': '100.0',
            'condition': 'new',
            'category_id': categories[0]['id'],
            'region_id': regions[0]['id'],
            'user_id': users[0]['id'],
            'contact_phone': '+966500000000',
            'contact_email': 'test@example.com'
        }
        
        files = {
            'images': ('test_image.png', io.BytesIO(test_image_content), 'image/png')
        }
        
        success, response = self.run_test(
            "Create Listing with Images",
            "POST",
            "api/listings",
            200,
            data=listing_data,
            files=files
        )
        
        if success and 'id' in response:
            self.created_resources['listings'].append(response['id'])
            print(f"   Listing created with {len(response.get('images', []))} images")
            
        return success, response

    def test_get_listings(self):
        """Test getting listings with various filters"""
        # Test basic listing retrieval
        success, response = self.run_test(
            "Get All Listings",
            "GET",
            "api/listings",
            200
        )
        
        if success:
            listings = response.get('listings', [])
            total = response.get('total', 0)
            print(f"   Found {len(listings)} listings (total: {total})")
            
        return success, response

    def test_search_listings(self, categories, regions):
        """Test listing search and filtering"""
        tests = [
            ("Search by keyword", f"api/listings?search=تجريبي"),
            ("Filter by condition", f"api/listings?condition=new"),
        ]
        
        if categories:
            tests.append(("Filter by category", f"api/listings?category_id={categories[0]['id']}"))
        if regions:
            tests.append(("Filter by region", f"api/listings?region_id={regions[0]['id']}"))
            
        all_passed = True
        for test_name, endpoint in tests:
            success, _ = self.run_test(test_name, "GET", endpoint, 200)
            if not success:
                all_passed = False
                
        return all_passed

    def test_admin_stats(self):
        """Test admin statistics endpoint"""
        success, response = self.run_test(
            "Admin Statistics",
            "GET",
            "api/admin/stats",
            200
        )
        
        if success:
            stats = ['total_listings', 'total_users', 'total_categories', 'total_regions', 'pending_payments', 'total_revenue']
            for stat in stats:
                if stat in response:
                    print(f"   {stat}: {response[stat]}")
                    
        return success, response

    def test_get_payments(self):
        """Test getting payment records"""
        success, response = self.run_test(
            "Get Payments",
            "GET",
            "api/payments",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   Found {len(response)} payment records")
            
        return success, response

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting السوق المفتوح API Tests")
        print("=" * 50)
        
        # Basic health check
        if not self.test_health_check():
            print("❌ Health check failed - stopping tests")
            return False
            
        # Test data retrieval
        categories_success, categories = self.test_get_categories()
        regions_success, regions = self.test_get_regions()
        
        # Test user creation and retrieval
        user_create_success, created_user = self.test_create_user()
        users_success, users = self.test_get_users()
        
        # Test category and region creation
        category_create_success, created_category = self.test_create_category()
        region_create_success, created_region = self.test_create_region()
        
        # Test listing creation with images
        listing_success, created_listing = self.test_create_listing_with_images(
            categories if categories_success else [],
            regions if regions_success else [],
            users if users_success else []
        )
        
        # Test listing retrieval and search
        listings_success, listings = self.test_get_listings()
        search_success = self.test_search_listings(
            categories if categories_success else [],
            regions if regions_success else []
        )
        
        # Test admin functionality
        admin_stats_success, admin_stats = self.test_admin_stats()
        payments_success, payments = self.test_get_payments()
        
        # Print final results
        print("\n" + "=" * 50)
        print("📊 Test Results Summary")
        print("=" * 50)
        print(f"Tests passed: {self.tests_passed}/{self.tests_run}")
        print(f"Success rate: {(self.tests_passed/self.tests_run)*100:.1f}%")
        
        # Test categories
        core_tests = [
            ("Health Check", self.test_health_check()),
            ("Categories API", categories_success),
            ("Regions API", regions_success),
            ("Users API", users_success),
            ("Listings API", listings_success),
            ("Admin Stats", admin_stats_success),
            ("Payments API", payments_success)
        ]
        
        print("\n🔍 Core Functionality Status:")
        for test_name, passed in core_tests:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {test_name}: {status}")
            
        # Feature tests
        feature_tests = [
            ("User Creation", user_create_success),
            ("Category Creation", category_create_success),
            ("Region Creation", region_create_success),
            ("Listing Creation with Images", listing_success),
            ("Search & Filtering", search_success)
        ]
        
        print("\n🚀 Feature Tests Status:")
        for test_name, passed in feature_tests:
            status = "✅ PASS" if passed else "❌ FAIL"
            print(f"   {test_name}: {status}")
            
        return self.tests_passed == self.tests_run

def main():
    """Main test execution"""
    tester = MarketplaceAPITester()
    
    try:
        success = tester.run_all_tests()
        return 0 if success else 1
    except KeyboardInterrupt:
        print("\n⚠️ Tests interrupted by user")
        return 1
    except Exception as e:
        print(f"\n💥 Unexpected error: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())