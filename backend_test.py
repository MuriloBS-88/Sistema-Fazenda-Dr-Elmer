import requests
import sys
import json
from datetime import datetime, date

class FarmAPITester:
    def __init__(self, base_url="https://farm-profit-pulse.preview.emergentagent.com"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.created_ids = {
            'categorias': [],
            'animais': [],
            'movimentacoes': [],
            'eventos': [],
            'despesas': []
        }

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/api/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return True, response.json() if response.content else {}
                except:
                    return True, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_detail = response.json()
                    print(f"   Error details: {error_detail}")
                except:
                    print(f"   Response text: {response.text}")
                return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_categorias(self):
        """Test categoria endpoints"""
        print("\n=== TESTING CATEGORIAS ===")
        
        # Test GET categorias (should work even if empty)
        success, categorias = self.run_test("List categorias", "GET", "categorias", 200)
        
        # Test POST categoria
        categoria_data = {
            "nome": "Test Categoria",
            "cor": "#FF5733"
        }
        success, categoria = self.run_test("Create categoria", "POST", "categorias", 200, categoria_data)
        if success and 'id' in categoria:
            self.created_ids['categorias'].append(categoria['id'])
            
            # Test DELETE categoria
            self.run_test("Delete categoria", "DELETE", f"categorias/{categoria['id']}", 200)

    def test_animais(self):
        """Test animal endpoints"""
        print("\n=== TESTING ANIMAIS ===")
        
        # Test GET animais
        success, animais = self.run_test("List animais", "GET", "animais", 200)
        
        # Test POST animal
        animal_data = {
            "tipo": "Bovino",
            "tag": "TEST001",
            "data_nascimento": "2023-01-15",
            "peso_atual": 450.5,
            "observacoes": "Animal de teste"
        }
        success, animal = self.run_test("Create animal", "POST", "animais", 200, animal_data)
        if success and 'id' in animal:
            animal_id = animal['id']
            self.created_ids['animais'].append(animal_id)
            
            # Test GET specific animal
            self.run_test("Get animal by ID", "GET", f"animais/{animal_id}", 200)
            
            # Test PUT animal
            update_data = {
                "tipo": "Bovino",
                "tag": "TEST001_UPDATED",
                "data_nascimento": "2023-01-15",
                "peso_atual": 460.0,
                "observacoes": "Animal de teste atualizado"
            }
            self.run_test("Update animal", "PUT", f"animais/{animal_id}", 200, update_data)
            
            # Test DELETE animal
            self.run_test("Delete animal", "DELETE", f"animais/{animal_id}", 200)

    def test_movimentacoes(self):
        """Test movimentacao endpoints"""
        print("\n=== TESTING MOVIMENTAÇÕES ===")
        
        # First create an animal for testing
        animal_data = {
            "tipo": "Bovino",
            "tag": "MOV_TEST001",
            "peso_atual": 400.0
        }
        success, animal = self.run_test("Create animal for movimentacao", "POST", "animais", 200, animal_data)
        if success and 'id' in animal:
            animal_id = animal['id']
            self.created_ids['animais'].append(animal_id)
            
            # Test GET movimentacoes
            self.run_test("List movimentacoes", "GET", "movimentacoes", 200)
            
            # Test POST entrada
            entrada_data = {
                "tipo": "entrada",
                "motivo": "compra",
                "animal_id": animal_id,
                "data": "2024-01-15",
                "valor": 2500.00,
                "quantidade": 1,
                "observacoes": "Compra de teste"
            }
            success, movimentacao = self.run_test("Create entrada", "POST", "movimentacoes", 200, entrada_data)
            if success and 'id' in movimentacao:
                self.created_ids['movimentacoes'].append(movimentacao['id'])
            
            # Test POST saida
            saida_data = {
                "tipo": "saida",
                "motivo": "venda",
                "animal_id": animal_id,
                "data": "2024-02-15",
                "valor": 3000.00,
                "quantidade": 1,
                "observacoes": "Venda de teste"
            }
            success, movimentacao = self.run_test("Create saida", "POST", "movimentacoes", 200, saida_data)
            if success and 'id' in movimentacao:
                self.created_ids['movimentacoes'].append(movimentacao['id'])

    def test_eventos(self):
        """Test evento endpoints"""
        print("\n=== TESTING EVENTOS ===")
        
        # First create an animal for testing
        animal_data = {
            "tipo": "Bovino",
            "tag": "EVENT_TEST001",
            "peso_atual": 350.0
        }
        success, animal = self.run_test("Create animal for evento", "POST", "animais", 200, animal_data)
        if success and 'id' in animal:
            animal_id = animal['id']
            self.created_ids['animais'].append(animal_id)
            
            # Test GET eventos
            self.run_test("List eventos", "GET", "eventos", 200)
            
            # Test POST pesagem (should update animal weight)
            pesagem_data = {
                "tipo": "pesagem",
                "animal_id": animal_id,
                "data": "2024-01-20",
                "peso": 380.5,
                "detalhes": "Pesagem mensal"
            }
            success, evento = self.run_test("Create pesagem evento", "POST", "eventos", 200, pesagem_data)
            if success and 'id' in evento:
                self.created_ids['eventos'].append(evento['id'])
                
                # Verify animal weight was updated
                success, updated_animal = self.run_test("Check updated animal weight", "GET", f"animais/{animal_id}", 200)
                if success and updated_animal.get('peso_atual') == 380.5:
                    print("✅ Animal weight updated correctly after pesagem")
                else:
                    print("❌ Animal weight not updated after pesagem")
            
            # Test POST vacinacao
            vacinacao_data = {
                "tipo": "vacinacao",
                "animal_id": animal_id,
                "data": "2024-01-25",
                "vacina": "Febre Aftosa",
                "detalhes": "Vacinação anual"
            }
            success, evento = self.run_test("Create vacinacao evento", "POST", "eventos", 200, vacinacao_data)
            if success and 'id' in evento:
                self.created_ids['eventos'].append(evento['id'])

    def test_despesas(self):
        """Test despesa endpoints"""
        print("\n=== TESTING DESPESAS ===")
        
        # First create a categoria for testing
        categoria_data = {
            "nome": "Despesa Teste",
            "cor": "#4A6741"
        }
        success, categoria = self.run_test("Create categoria for despesa", "POST", "categorias", 200, categoria_data)
        if success and 'id' in categoria:
            categoria_id = categoria['id']
            self.created_ids['categorias'].append(categoria_id)
            
            # Test GET despesas
            self.run_test("List despesas", "GET", "despesas", 200)
            
            # Test POST despesa
            despesa_data = {
                "categoria_id": categoria_id,
                "valor": 150.75,
                "data": "2024-01-30",
                "descricao": "Despesa de teste"
            }
            success, despesa = self.run_test("Create despesa", "POST", "despesas", 200, despesa_data)
            if success and 'id' in despesa:
                self.created_ids['despesas'].append(despesa['id'])

    def test_dashboard(self):
        """Test dashboard stats endpoint"""
        print("\n=== TESTING DASHBOARD ===")
        
        success, stats = self.run_test("Get dashboard stats", "GET", "dashboard/stats", 200)
        if success:
            required_fields = ['total_animais', 'total_ativos', 'receitas', 'despesas', 'lucro']
            for field in required_fields:
                if field in stats:
                    print(f"✅ Dashboard has {field}: {stats[field]}")
                else:
                    print(f"❌ Dashboard missing {field}")

    def test_relatorios(self):
        """Test report generation endpoints"""
        print("\n=== TESTING RELATÓRIOS ===")
        
        # Test PDF generation
        try:
            response = requests.get(f"{self.base_url}/api/relatorios/pdf")
            if response.status_code == 200 and response.headers.get('content-type') == 'application/pdf':
                print("✅ PDF report generation working")
                self.tests_passed += 1
            else:
                print(f"❌ PDF report failed - Status: {response.status_code}")
            self.tests_run += 1
        except Exception as e:
            print(f"❌ PDF report error: {str(e)}")
            self.tests_run += 1
        
        # Test Excel generation
        try:
            response = requests.get(f"{self.base_url}/api/relatorios/excel")
            if response.status_code == 200 and 'spreadsheet' in response.headers.get('content-type', ''):
                print("✅ Excel report generation working")
                self.tests_passed += 1
            else:
                print(f"❌ Excel report failed - Status: {response.status_code}")
            self.tests_run += 1
        except Exception as e:
            print(f"❌ Excel report error: {str(e)}")
            self.tests_run += 1

    def cleanup(self):
        """Clean up created test data"""
        print("\n=== CLEANUP ===")
        
        # Delete in reverse order to avoid foreign key issues
        for despesa_id in self.created_ids['despesas']:
            self.run_test(f"Cleanup despesa {despesa_id}", "DELETE", f"despesas/{despesa_id}", 200)
        
        for evento_id in self.created_ids['eventos']:
            self.run_test(f"Cleanup evento {evento_id}", "DELETE", f"eventos/{evento_id}", 200)
        
        for mov_id in self.created_ids['movimentacoes']:
            self.run_test(f"Cleanup movimentacao {mov_id}", "DELETE", f"movimentacoes/{mov_id}", 200)
        
        for animal_id in self.created_ids['animais']:
            self.run_test(f"Cleanup animal {animal_id}", "DELETE", f"animais/{animal_id}", 200)
        
        for cat_id in self.created_ids['categorias']:
            self.run_test(f"Cleanup categoria {cat_id}", "DELETE", f"categorias/{cat_id}", 200)

def main():
    print("🚀 Starting Farm Management API Tests")
    print("=" * 50)
    
    tester = FarmAPITester()
    
    try:
        # Run all tests
        tester.test_categorias()
        tester.test_animais()
        tester.test_movimentacoes()
        tester.test_eventos()
        tester.test_despesas()
        tester.test_dashboard()
        tester.test_relatorios()
        
        # Cleanup
        tester.cleanup()
        
        # Print results
        print("\n" + "=" * 50)
        print(f"📊 Tests completed: {tester.tests_passed}/{tester.tests_run}")
        success_rate = (tester.tests_passed / tester.tests_run * 100) if tester.tests_run > 0 else 0
        print(f"📈 Success rate: {success_rate:.1f}%")
        
        if success_rate >= 90:
            print("🎉 Backend APIs are working well!")
            return 0
        elif success_rate >= 70:
            print("⚠️  Backend has some issues but mostly functional")
            return 1
        else:
            print("❌ Backend has significant issues")
            return 2
            
    except Exception as e:
        print(f"💥 Test suite failed: {str(e)}")
        return 3

if __name__ == "__main__":
    sys.exit(main())