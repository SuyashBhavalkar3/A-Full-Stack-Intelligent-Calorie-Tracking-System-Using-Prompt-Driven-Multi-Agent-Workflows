import 'package:flutter/material.dart';

void main() {
  runApp(const MacroMindApp());
}

final appState = AppState();

class MacroMindApp extends StatelessWidget {
  const MacroMindApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MacroMind',
      theme: ThemeData(
        useMaterial3: true,
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      initialRoute: AppRoutes.home,
      routes: {
        AppRoutes.home: (context) => IndexScreen(),
        AppRoutes.login: (context) => LoginScreen(),
        AppRoutes.register: (context) => RegisterScreen(),
        AppRoutes.setup: (context) => ProfileSetupScreen(),
        AppRoutes.dashboard: (context) => DashboardScreen(),
        AppRoutes.goals: (context) => GoalsScreen(),
        AppRoutes.weight: (context) => WeightScreen(),
        AppRoutes.profile: (context) => ProfileScreen(),
      },
      onUnknownRoute: (_) => MaterialPageRoute(builder: (_) => const NotFoundScreen()),
    );
  }
}

class AppRoutes {
  static const home = '/';
  static const login = '/login';
  static const register = '/register';
  static const setup = '/setup';
  static const dashboard = '/dashboard';
  static const goals = '/goals';
  static const weight = '/weight';
  static const profile = '/profile';
}

enum Gender { male, female, other }

enum ActivityLevel { sedentary, light, moderate, active, veryActive }

enum GoalType { lose, maintain, gain }

extension GenderLabel on Gender {
  String get label {
    switch (this) {
      case Gender.male:
        return 'Male';
      case Gender.female:
        return 'Female';
      case Gender.other:
        return 'Other';
    }
  }
}

extension ActivityLevelLabel on ActivityLevel {
  String get label {
    switch (this) {
      case ActivityLevel.sedentary:
        return 'Sedentary';
      case ActivityLevel.light:
        return 'Light';
      case ActivityLevel.moderate:
        return 'Moderate';
      case ActivityLevel.active:
        return 'Active';
      case ActivityLevel.veryActive:
        return 'Very Active';
    }
  }

  String get description {
    switch (this) {
      case ActivityLevel.sedentary:
        return 'Little to no exercise';
      case ActivityLevel.light:
        return 'Light exercise 1-3 days/week';
      case ActivityLevel.moderate:
        return 'Moderate exercise 3-5 days/week';
      case ActivityLevel.active:
        return 'Hard exercise 6-7 days/week';
      case ActivityLevel.veryActive:
        return 'Very hard exercise or physical job';
    }
  }
}

extension GoalTypeLabel on GoalType {
  String get label {
    switch (this) {
      case GoalType.lose:
        return 'Lose';
      case GoalType.maintain:
        return 'Maintain';
      case GoalType.gain:
        return 'Gain';
    }
  }
}

class FoodLogEntry {
  final String id;
  final String name;
  final int calories;
  final int protein;
  final int carbs;
  final int fat;
  final DateTime time;

  FoodLogEntry({
    required this.id,
    required this.name,
    required this.calories,
    required this.protein,
    required this.carbs,
    required this.fat,
    required this.time,
  });
}

class WeightEntry {
  final DateTime date;
  final double weight;

  WeightEntry({required this.date, required this.weight});
}

class AppState extends ChangeNotifier {
  bool isLoggedIn = false;
  bool hasAccount = false;
  String fullName = '';
  String email = '';
  String password = '';

  int age = 25;
  Gender gender = Gender.male;
  int heightCm = 170;
  double weightKg = 70.0;
  ActivityLevel activityLevel = ActivityLevel.moderate;

  GoalType goalType = GoalType.lose;
  int targetCalories = 2200;
  int proteinGoal = 150;
  int carbsGoal = 220;
  int fatGoal = 65;
  double weightGoal = 70.0;
  double weeklyGoalKg = 0.5;
  int waterGoalGlasses = 8;
  int waterGlasses = 0;

  final List<FoodLogEntry> logs = [];
  final List<WeightEntry> weightHistory = [];

  bool get hasProfile => age > 0 && heightCm > 0 && weightKg > 0;
  bool get hasGoals => targetCalories > 0 && proteinGoal > 0 && carbsGoal > 0 && fatGoal > 0;
  bool get setupComplete => isLoggedIn && hasProfile && hasGoals;

  Future<void> login(String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 250));
    if (!email.contains('@') || password.length < 6) {
      throw 'Please enter a valid email and password with at least 6 characters.';
    }
    if (!hasAccount) {
      fullName = 'MacroMind User';
      this.email = email;
      this.password = password;
      hasAccount = true;
    } else if (this.email != email || this.password != password) {
      throw 'Invalid credentials. Please register or try again.';
    }
    isLoggedIn = true;
    if (weightHistory.isEmpty) {
      weightHistory.add(WeightEntry(date: DateTime.now(), weight: weightKg));
    }
    notifyListeners();
  }

  Future<void> register(String fullName, String email, String password) async {
    await Future.delayed(const Duration(milliseconds: 250));
    if (fullName.trim().length < 2) {
      throw 'Please enter a name with at least 2 characters.';
    }
    if (!email.contains('@') || password.length < 8) {
      throw 'Please enter a valid email and password with at least 8 characters.';
    }
    this.fullName = fullName.trim();
    this.email = email;
    this.password = password;
    hasAccount = true;
    isLoggedIn = true;
    notifyListeners();
  }

  void logout() {
    isLoggedIn = false;
    notifyListeners();
  }

  void completeProfile({
    required int age,
    required Gender gender,
    required int heightCm,
    required double weightKg,
    required ActivityLevel activity,
  }) {
    this.age = age;
    this.gender = gender;
    this.heightCm = heightCm;
    this.weightKg = weightKg;
    activityLevel = activity;
    if (weightHistory.isEmpty) {
      weightHistory.add(WeightEntry(date: DateTime.now(), weight: weightKg));
    }
    notifyListeners();
  }

  void updateGoals({
    required GoalType goalType,
    required int targetCalories,
    required int proteinGoal,
    required int carbsGoal,
    required int fatGoal,
    required double weightGoal,
    required double weeklyGoalKg,
    required int waterGoalGlasses,
  }) {
    this.goalType = goalType;
    this.targetCalories = targetCalories;
    this.proteinGoal = proteinGoal;
    this.carbsGoal = carbsGoal;
    this.fatGoal = fatGoal;
    this.weightGoal = weightGoal;
    this.weeklyGoalKg = weeklyGoalKg;
    this.waterGoalGlasses = waterGoalGlasses;
    notifyListeners();
  }

  void addWaterGlass() {
    if (waterGlasses < waterGoalGlasses) {
      waterGlasses += 1;
      notifyListeners();
    }
  }

  void addFoodLog(String input) {
    final description = input.trim().isEmpty ? 'Quick meal log' : input.trim();
    final int base = description.length * 8;
    final int calories = 150 + (base % 450);
    final int protein = 10 + (base % 40);
    final int carbs = 15 + (base % 70);
    final int fat = 5 + (base % 25);
    logs.insert(
      0,
      FoodLogEntry(
        id: DateTime.now().microsecondsSinceEpoch.toString(),
        name: description,
        calories: calories,
        protein: protein,
        carbs: carbs,
        fat: fat,
        time: DateTime.now(),
      ),
    );
    notifyListeners();
  }

  void logWeight(double weight) {
    weightKg = weight;
    weightHistory.add(WeightEntry(date: DateTime.now(), weight: weight));
    notifyListeners();
  }

  int get caloriesConsumed {
    return logs.fold(0, (sum, item) => sum + item.calories);
  }

  int get proteinConsumed {
    return logs.fold(0, (sum, item) => sum + item.protein);
  }

  int get carbsConsumed {
    return logs.fold(0, (sum, item) => sum + item.carbs);
  }

  int get fatConsumed {
    return logs.fold(0, (sum, item) => sum + item.fat);
  }

  double get currentWeight {
    return weightHistory.isNotEmpty ? weightHistory.last.weight : weightKg;
  }

  String get currentGoalDate {
    if (goalType == GoalType.maintain || weeklyGoalKg <= 0) {
      return 'Maintain your current pace';
    }
    final difference = (currentWeight - weightGoal).abs();
    final weeks = (difference / weeklyGoalKg).ceil();
    final targetDate = DateTime.now().add(Duration(days: weeks * 7));
    return 'Target date: ${targetDate.month}/${targetDate.day}/${targetDate.year}';
  }

  int calculateSuggestedCalories() {
    final bmr = gender == Gender.male
        ? 88.362 + (13.397 * weightKg) + (4.799 * heightCm) - (5.677 * age)
        : 447.593 + (9.247 * weightKg) + (3.098 * heightCm) - (4.330 * age);
    final multiplier = switch (activityLevel) {
      ActivityLevel.sedentary => 1.2,
      ActivityLevel.light => 1.375,
      ActivityLevel.moderate => 1.55,
      ActivityLevel.active => 1.725,
      ActivityLevel.veryActive => 1.9,
    };
    return (bmr * multiplier).round();
  }

  int calculateSuggestedProtein() {
    return (weightKg * 2).round();
  }

  int calculateSuggestedFat() {
    final calories = calculateSuggestedCalories();
    return ((calories * 0.25) / 9).round();
  }

  int calculateSuggestedCarbs() {
    final calories = calculateSuggestedCalories();
    final proteinCalories = calculateSuggestedProtein() * 4;
    final fatCalories = calculateSuggestedFat() * 9;
    final carbsCalories = calories - proteinCalories - fatCalories;
    return (carbsCalories / 4).round();
  }
}

class IndexScreen extends StatelessWidget {
  IndexScreen({super.key});

  final List<Map<String, String>> features = [
    {
      'title': 'AI-Powered Logging',
      'description': 'Describe what you ate and get calories plus macros instantly.',
    },
    {
      'title': 'Smart Goals',
      'description': 'Get personalized calorie and macro targets for your body.',
    },
    {
      'title': 'Progress Tracking',
      'description': 'Visualize your weight journey and daily nutrition status.',
    },
    {
      'title': 'Water Tracking',
      'description': 'Stay hydrated with a simple daily water tracker.',
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('MacroMind'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.login),
            child: const Text('Sign In', style: TextStyle(color: Colors.white)),
          ),
          TextButton(
            onPressed: () => Navigator.pushNamed(context, AppRoutes.register),
            child: const Text('Get Started', style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(vertical: 24, horizontal: 18),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(24),
                color: Colors.deepPurple.shade50,
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text('AI-Powered Nutrition Tracking', style: TextStyle(fontWeight: FontWeight.w700, fontSize: 16, color: Colors.deepPurple)),
                  const SizedBox(height: 16),
                  const Text('Track your calories with AI magic', style: TextStyle(fontSize: 36, fontWeight: FontWeight.bold, height: 1.1)),
                  const SizedBox(height: 16),
                  const Text('Simply describe what you ate and let MacroMind calculate the calories and macros for you. No more tedious manual logging.', style: TextStyle(fontSize: 16, color: Colors.black87)),
                  const SizedBox(height: 20),
                  Row(
                    children: [
                      ElevatedButton(
                        onPressed: () => Navigator.pushNamed(context, AppRoutes.register),
                        style: ElevatedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14)),
                        child: const Text('Start Free Trial', style: TextStyle(fontSize: 16)),
                      ),
                      const SizedBox(width: 12),
                      OutlinedButton(
                        onPressed: () => Navigator.pushNamed(context, AppRoutes.login),
                        style: OutlinedButton.styleFrom(shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14)),
                        child: const Text('Sign In', style: TextStyle(fontSize: 16)),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 28),
            const Text('Everything you need to reach your goals', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            const Text('MacroMind combines AI intelligence with simple design to make nutrition tracking effortless.', style: TextStyle(fontSize: 16, color: Colors.black54)),
            const SizedBox(height: 20),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(crossAxisCount: 1, mainAxisSpacing: 16, crossAxisSpacing: 16, childAspectRatio: 3),
              itemCount: features.length,
              itemBuilder: (context, index) {
                final feature = features[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade300), boxShadow: [BoxShadow(color: Colors.black.withOpacity(0.03), blurRadius: 12, offset: const Offset(0, 4))]),
                  child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                    Text(feature['title']!, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.w700)),
                    const SizedBox(height: 6),
                    Text(feature['description']!, style: const TextStyle(color: Colors.black54)),
                  ]),
                );
              },
            ),
            const SizedBox(height: 24),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(color: Colors.deepPurple.shade700, borderRadius: BorderRadius.circular(24)),
              child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                const Text('Ready to transform your health?', style: TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                const Text('Join thousands of users who are achieving their nutrition goals with MacroMind.', style: TextStyle(color: Colors.white70, fontSize: 16)),
                const SizedBox(height: 18),
                ElevatedButton(
                  onPressed: () => Navigator.pushNamed(context, AppRoutes.register),
                  style: ElevatedButton.styleFrom(backgroundColor: Colors.white, foregroundColor: Colors.deepPurple, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)), padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14)),
                  child: const Text('Get Started Free', style: TextStyle(fontSize: 16)),
                ),
              ]),
            ),
            const SizedBox(height: 24),
            Center(child: Text('© 2024 MacroMind. All rights reserved.', style: TextStyle(color: Colors.grey.shade600))),
            const SizedBox(height: 16),
          ],
        ),
      ),
    );
  }
}

class LoginScreen extends StatefulWidget {
  LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  bool _showPassword = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _emailController.dispose();
    _passwordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _isLoading = true);
    try {
      await appState.login(_emailController.text.trim(), _passwordController.text);
      if (!appState.setupComplete) {
        Navigator.pushReplacementNamed(context, AppRoutes.setup);
      } else {
        Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
      }
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Welcome back!')));
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Sign In')),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Welcome back', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('Enter your credentials to access your account.', style: TextStyle(color: Colors.black54)),
                const SizedBox(height: 24),
                Form(
                  key: _formKey,
                  child: Column(children: [
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || value.isEmpty || !value.contains('@')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordController,
                      decoration: InputDecoration(labelText: 'Password', border: const OutlineInputBorder(), suffixIcon: IconButton(icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility), onPressed: () => setState(() => _showPassword = !_showPassword))),
                      obscureText: !_showPassword,
                      validator: (value) {
                        if (value == null || value.length < 6) {
                          return 'Password must be at least 6 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                      child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Sign In', style: TextStyle(fontSize: 16)),
                    ),
                  ]),
                ),
                const SizedBox(height: 18),
                OutlinedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Google login placeholder')));
                  },
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: const Text('Continue with Google'),
                ),
                const SizedBox(height: 18),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Text('Don\'t have an account? '),
                  TextButton(onPressed: () => Navigator.pushReplacementNamed(context, AppRoutes.register), child: const Text('Sign up')),
                ]),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class RegisterScreen extends StatefulWidget {
  RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _fullNameController = TextEditingController();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _confirmPasswordController = TextEditingController();
  bool _showPassword = false;
  bool _isLoading = false;

  @override
  void dispose() {
    _fullNameController.dispose();
    _emailController.dispose();
    _passwordController.dispose();
    _confirmPasswordController.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _isLoading = true);
    try {
      await appState.register(
        _fullNameController.text.trim(),
        _emailController.text.trim(),
        _passwordController.text,
      );
      Navigator.pushReplacementNamed(context, AppRoutes.setup);
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Account created!')));
    } catch (error) {
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(error.toString())));
    } finally {
      setState(() => _isLoading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Create Account')),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 500),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Create your account', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('Start your nutrition journey today.', style: TextStyle(color: Colors.black54)),
                const SizedBox(height: 24),
                Form(
                  key: _formKey,
                  child: Column(children: [
                    TextFormField(
                      controller: _fullNameController,
                      decoration: const InputDecoration(labelText: 'Full Name', border: OutlineInputBorder()),
                      validator: (value) {
                        if (value == null || value.trim().length < 2) {
                          return 'Name must be at least 2 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _emailController,
                      decoration: const InputDecoration(labelText: 'Email', border: OutlineInputBorder()),
                      keyboardType: TextInputType.emailAddress,
                      validator: (value) {
                        if (value == null || !value.contains('@')) {
                          return 'Please enter a valid email';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _passwordController,
                      obscureText: !_showPassword,
                      decoration: InputDecoration(labelText: 'Password', border: const OutlineInputBorder(), suffixIcon: IconButton(icon: Icon(_showPassword ? Icons.visibility_off : Icons.visibility), onPressed: () => setState(() => _showPassword = !_showPassword))),
                      validator: (value) {
                        if (value == null || value.length < 8) {
                          return 'Password must be at least 8 characters';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 16),
                    TextFormField(
                      controller: _confirmPasswordController,
                      obscureText: true,
                      decoration: const InputDecoration(labelText: 'Confirm Password', border: OutlineInputBorder()),
                      validator: (value) {
                        if (value != _passwordController.text) {
                          return 'Passwords do not match';
                        }
                        return null;
                      },
                    ),
                    const SizedBox(height: 24),
                    ElevatedButton(
                      onPressed: _isLoading ? null : _submit,
                      style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                      child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Create Account', style: TextStyle(fontSize: 16)),
                    ),
                  ]),
                ),
                const SizedBox(height: 18),
                OutlinedButton(
                  onPressed: () {
                    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Google sign-up placeholder')));
                  },
                  style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                  child: const Text('Continue with Google'),
                ),
                const SizedBox(height: 18),
                Row(mainAxisAlignment: MainAxisAlignment.center, children: [
                  const Text('Already have an account? '),
                  TextButton(onPressed: () => Navigator.pushReplacementNamed(context, AppRoutes.login), child: const Text('Sign in')),
                ]),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class ProfileSetupScreen extends StatefulWidget {
  ProfileSetupScreen({super.key});

  @override
  State<ProfileSetupScreen> createState() => _ProfileSetupScreenState();
}

class _ProfileSetupScreenState extends State<ProfileSetupScreen> {
  int _step = 1;
  final _profileFormKey = GlobalKey<FormState>();
  final _goalsFormKey = GlobalKey<FormState>();

  final _ageController = TextEditingController(text: '25');
  Gender _gender = Gender.male;
  final _heightController = TextEditingController(text: '170');
  final _weightController = TextEditingController(text: '70');
  ActivityLevel _activityLevel = ActivityLevel.moderate;

  GoalType _goalType = GoalType.lose;
  final _weightGoalController = TextEditingController(text: '70');
  final _weeklyGoalController = TextEditingController(text: '0.5');
  final _calorieTargetController = TextEditingController(text: '2200');
  final _proteinController = TextEditingController(text: '150');
  final _carbsController = TextEditingController(text: '220');
  final _fatController = TextEditingController(text: '65');
  final _waterGoalController = TextEditingController(text: '8');

  bool _isLoading = false;

  @override
  void dispose() {
    _ageController.dispose();
    _heightController.dispose();
    _weightController.dispose();
    _weightGoalController.dispose();
    _weeklyGoalController.dispose();
    _calorieTargetController.dispose();
    _proteinController.dispose();
    _carbsController.dispose();
    _fatController.dispose();
    _waterGoalController.dispose();
    super.dispose();
  }

  void _goToNextStep() {
    if (_profileFormKey.currentState!.validate()) {
      appState.completeProfile(
        age: int.parse(_ageController.text),
        gender: _gender,
        heightCm: int.parse(_heightController.text),
        weightKg: double.parse(_weightController.text),
        activity: _activityLevel,
      );
      final suggestedCalories = appState.calculateSuggestedCalories();
      _calorieTargetController.text = suggestedCalories.toString();
      _proteinController.text = appState.calculateSuggestedProtein().toString();
      _carbsController.text = appState.calculateSuggestedCarbs().toString();
      _fatController.text = appState.calculateSuggestedFat().toString();
      _weightGoalController.text = _weightController.text;
      setState(() => _step = 2);
    }
  }

  Future<void> _completeSetup() async {
    if (!_goalsFormKey.currentState!.validate()) {
      return;
    }
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(milliseconds: 250));
    appState.updateGoals(
      goalType: _goalType,
      targetCalories: int.parse(_calorieTargetController.text),
      proteinGoal: int.parse(_proteinController.text),
      carbsGoal: int.parse(_carbsController.text),
      fatGoal: int.parse(_fatController.text),
      weightGoal: double.parse(_weightGoalController.text),
      weeklyGoalKg: double.parse(_weeklyGoalController.text),
      waterGoalGlasses: int.parse(_waterGoalController.text),
    );
    setState(() => _isLoading = false);
    Navigator.pushReplacementNamed(context, AppRoutes.dashboard);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Profile complete!')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Profile Setup')),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: Center(
          child: ConstrainedBox(
            constraints: const BoxConstraints(maxWidth: 700),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                const Text('Onboarding', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                const Text('Complete your profile so MacroMind can personalize your daily targets.', style: TextStyle(color: Colors.black54)),
                const SizedBox(height: 18),
                Row(children: [
                  Expanded(child: ProgressChip(label: 'Profile', active: _step >= 1)),
                  Expanded(child: ProgressChip(label: 'Goals', active: _step >= 2)),
                ]),
                const SizedBox(height: 24),
                Expanded(
                  child: SingleChildScrollView(
                    child: _step == 1 ? _buildProfileForm() : _buildGoalsForm(),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildProfileForm() {
    return Form(
      key: _profileFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Tell us about yourself', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('This helps us calculate your daily calorie and macro targets.', style: TextStyle(color: Colors.black54)),
          const SizedBox(height: 24),
          Row(children: [
            Expanded(child: _buildNumberField(controller: _ageController, label: 'Age', hint: '25', validator: _validateAge)),
            const SizedBox(width: 16),
            Expanded(child: _buildGenderSelector()),
          ]),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: _buildNumberField(controller: _heightController, label: 'Height (cm)', hint: '170', validator: _validateHeight)),
            const SizedBox(width: 16),
            Expanded(child: _buildNumberField(controller: _weightController, label: 'Weight (kg)', hint: '70', validator: _validateWeight)),
          ]),
          const SizedBox(height: 16),
          const Text('Activity Level', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 12),
          Wrap(
            spacing: 10,
            runSpacing: 10,
            children: ActivityLevel.values.map((activity) {
              final active = activity == _activityLevel;
              return ChoiceChip(
                label: Text(activity.label),
                selected: active,
                onSelected: (_) => setState(() => _activityLevel = activity),
              );
            }).toList(),
          ),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: _goToNextStep,
            style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
            child: const Text('Continue', style: TextStyle(fontSize: 16)),
          ),
        ],
      ),
    );
  }

  Widget _buildGoalsForm() {
    return Form(
      key: _goalsFormKey,
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text('Set your goals', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('We have suggested values based on your profile. Adjust them as needed.', style: TextStyle(color: Colors.black54)),
          const SizedBox(height: 24),
          _buildGoalTypeSelector(),
          const SizedBox(height: 20),
          Row(children: [
            Expanded(child: _buildNumberField(controller: _weightGoalController, label: 'Target Weight (kg)', hint: '70', validator: _validateWeightGoal)),
            const SizedBox(width: 16),
            Expanded(child: _buildNumberField(controller: _weeklyGoalController, label: 'Weekly Rate (kg)', hint: '0.5', validator: _validateWeeklyRate)),
          ]),
          const SizedBox(height: 16),
          _buildNumberField(controller: _calorieTargetController, label: 'Daily Calories', hint: '2200', validator: _validateCalories),
          const SizedBox(height: 16),
          Row(children: [
            Expanded(child: _buildNumberField(controller: _proteinController, label: 'Protein (g)', hint: '150', validator: _validateMacros)),
            const SizedBox(width: 12),
            Expanded(child: _buildNumberField(controller: _carbsController, label: 'Carbs (g)', hint: '220', validator: _validateMacros)),
            const SizedBox(width: 12),
            Expanded(child: _buildNumberField(controller: _fatController, label: 'Fat (g)', hint: '65', validator: _validateMacros)),
          ]),
          const SizedBox(height: 16),
          _buildNumberField(controller: _waterGoalController, label: 'Water Goal (glasses)', hint: '8', validator: _validateWaterGoal),
          const SizedBox(height: 24),
          Row(children: [
            OutlinedButton(onPressed: () => setState(() => _step = 1), style: OutlinedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: const Text('Back')),
            const SizedBox(width: 12),
            Expanded(child: ElevatedButton(onPressed: _isLoading ? null : _completeSetup, style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))), child: _isLoading ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Complete Setup', style: TextStyle(fontSize: 16)))),
          ]),
        ],
      ),
    );
  }

  Widget _buildGenderSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Gender', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(spacing: 10, children: Gender.values.map((gender) {
          final active = gender == _gender;
          return ChoiceChip(label: Text(gender.label), selected: active, onSelected: (_) => setState(() => _gender = gender));
        }).toList()),
      ],
    );
  }

  Widget _buildGoalTypeSelector() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Goal Type', style: TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Wrap(spacing: 10, children: GoalType.values.map((goal) {
          final active = goal == _goalType;
          return ChoiceChip(label: Text(goal.label), selected: active, onSelected: (_) => setState(() => _goalType = goal));
        }).toList()),
      ],
    );
  }

  Widget _buildNumberField({required TextEditingController controller, required String label, required String hint, required String? Function(String?) validator}) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label, hintText: hint, border: const OutlineInputBorder()),
      keyboardType: TextInputType.number,
      validator: validator,
    );
  }

  String? _validateAge(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 13 || number > 120) {
      return 'Enter a valid age';
    }
    return null;
  }

  String? _validateHeight(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 100 || number > 250) {
      return 'Enter height in cm';
    }
    return null;
  }

  String? _validateWeight(String? value) {
    final number = double.tryParse(value ?? '');
    if (number == null || number < 30 || number > 300) {
      return 'Enter weight in kg';
    }
    return null;
  }

  String? _validateWeightGoal(String? value) {
    final number = double.tryParse(value ?? '');
    if (number == null || number < 30 || number > 300) {
      return 'Enter a realistic weight';
    }
    return null;
  }

  String? _validateWeeklyRate(String? value) {
    final number = double.tryParse(value ?? '');
    if (number == null || number < 0.25 || number > 3) {
      return 'Enter a value between 0.25 and 3';
    }
    return null;
  }

  String? _validateCalories(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 1000 || number > 5000) {
      return 'Enter a value between 1000 and 5000';
    }
    return null;
  }

  String? _validateMacros(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 0) {
      return 'Enter a valid number';
    }
    return null;
  }

  String? _validateWaterGoal(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 1 || number > 20) {
      return 'Enter between 1 and 20 glasses';
    }
    return null;
  }
}

class DashboardScreen extends StatefulWidget {
  DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  final _aiController = TextEditingController();
  bool _isLogging = false;

  @override
  void dispose() {
    _aiController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: appState,
      builder: (context, child) {
        if (!appState.isLoggedIn) {
          Future.microtask(() => Navigator.pushReplacementNamed(context, AppRoutes.login));
          return const Scaffold(body: SizedBox.shrink());
        }

        final goalsReady = appState.hasGoals;

        return Scaffold(
          appBar: AppBar(
            title: const Text('Dashboard'),
            actions: [
              IconButton(onPressed: () => Navigator.pushNamed(context, AppRoutes.profile), icon: const Icon(Icons.person)),
            ],
          ),
          body: Padding(
            padding: const EdgeInsets.all(18),
            child: SingleChildScrollView(
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                const Text('Track your nutrition and fitness progress', style: TextStyle(fontSize: 18, color: Colors.black54)),
                const SizedBox(height: 24),
                _buildAiInput(),
                const SizedBox(height: 24),
                goalsReady ? _buildSummaryCards() : _buildSetupPrompt(context),
                const SizedBox(height: 24),
                _buildLogSection(),
                const SizedBox(height: 24),
                _buildBottomActions(context),
              ]),
            ),
          ),
        );
      },
    );
  }

  Widget _buildAiInput() {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('AI Food Logger', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 12),
      TextField(
        controller: _aiController,
        decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'e.g. 2 eggs, toast with avocado, coffee'),
      ),
      const SizedBox(height: 12),
      ElevatedButton(
        onPressed: _isLogging ? null : _logFood,
        style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
        child: _isLogging ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Log Meal', style: TextStyle(fontSize: 16)),
      ),
    ]);
  }

  Future<void> _logFood() async {
    final input = _aiController.text.trim();
    if (input.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Describe your meal first')));
      return;
    }
    setState(() => _isLogging = true);
    await Future.delayed(const Duration(milliseconds: 250));
    appState.addFoodLog(input);
    _aiController.clear();
    setState(() => _isLogging = false);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Logged successfully!')));
  }

  Widget _buildSetupPrompt(BuildContext context) {
    return Card(
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
      child: Padding(
        padding: const EdgeInsets.all(20),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Complete your setup', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          const Text('Set your profile and goals before using the dashboard metrics.', style: TextStyle(color: Colors.black54)),
          const SizedBox(height: 16),
          ElevatedButton(onPressed: () => Navigator.pushNamed(context, AppRoutes.setup), child: const Text('Complete Setup')),
        ]),
      ),
    );
  }

  Widget _buildSummaryCards() {
    final app = appState;
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      Row(children: [
        _buildMetricCard('Calories', app.caloriesConsumed, app.targetCalories, 'kcal'),
        const SizedBox(width: 12),
        _buildMetricCard('Water', app.waterGlasses, app.waterGoalGlasses, 'glasses'),
      ]),
      const SizedBox(height: 16),
      Row(children: [
        _buildMacroCard('Protein', app.proteinConsumed, app.proteinGoal, 'g', Colors.blue),
        const SizedBox(width: 12),
        _buildMacroCard('Carbs', app.carbsConsumed, app.carbsGoal, 'g', Colors.green),
      ]),
      const SizedBox(height: 16),
      _buildMacroCard('Fat', app.fatConsumed, app.fatGoal, 'g', Colors.orange),
      const SizedBox(height: 16),
      Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(color: Colors.deepPurple.shade50, borderRadius: BorderRadius.circular(20)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          const Text('Goal Date', style: TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(app.currentGoalDate, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
        ]),
      ),
    ]);
  }

  Widget _buildMetricCard(String label, int value, int goal, String unit) {
    final progress = goal > 0 ? (value / goal).clamp(0.0, 1.0) : 0.0;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(18),
        decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade300)),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
          const SizedBox(height: 10),
          Text('$value / $goal $unit', style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          LinearProgressIndicator(value: progress, minHeight: 10),
        ]),
      ),
    );
  }

  Widget _buildMacroCard(String label, int value, int goal, String unit, Color color) {
    final progress = goal > 0 ? (value / goal).clamp(0.0, 1.0) : 0.0;
    return Container(
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade300)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 10),
        Text('$value / $goal $unit', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: color)),
        const SizedBox(height: 12),
        LinearProgressIndicator(value: progress, minHeight: 10, color: color),
      ]),
    );
  }

  Widget _buildLogSection() {
    return Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
      const Text('Today\'s Log', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
      const SizedBox(height: 12),
      if (appState.logs.isEmpty)
        Container(
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(color: Colors.grey.shade200, borderRadius: BorderRadius.circular(20)),
          child: const Text('No entries yet today. Use the AI logger above to add your first meal.'),
        )
      else
        Column(children: appState.logs.map((entry) => _buildLogTile(entry)).toList()),
    ]);
  }

  Widget _buildLogTile(FoodLogEntry entry) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.shade300)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(entry.name, style: const TextStyle(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
          Text('${entry.calories} kcal', style: const TextStyle(fontWeight: FontWeight.bold)),
          Text('${entry.time.hour.toString().padLeft(2, '0')}:${entry.time.minute.toString().padLeft(2, '0')}', style: const TextStyle(color: Colors.black54)),
        ]),
        const SizedBox(height: 6),
        Text('Protein ${entry.protein}g · Carbs ${entry.carbs}g · Fat ${entry.fat}g', style: const TextStyle(color: Colors.black54)),
      ]),
    );
  }

  Widget _buildBottomActions(BuildContext context) {
    return Wrap(spacing: 12, runSpacing: 12, children: [
      FilledButton(onPressed: () => Navigator.pushNamed(context, AppRoutes.goals), child: const Text('Goals')),
      FilledButton(onPressed: () => Navigator.pushNamed(context, AppRoutes.weight), child: const Text('Weight')),
      FilledButton(onPressed: () => Navigator.pushNamed(context, AppRoutes.profile), child: const Text('Profile')),
    ]);
  }
}

class GoalsScreen extends StatefulWidget {
  GoalsScreen({super.key});

  @override
  State<GoalsScreen> createState() => _GoalsScreenState();
}

class _GoalsScreenState extends State<GoalsScreen> {
  final _formKey = GlobalKey<FormState>();
  late final TextEditingController _targetCaloriesController;
  late final TextEditingController _proteinController;
  late final TextEditingController _carbsController;
  late final TextEditingController _fatController;
  late final TextEditingController _weightGoalController;
  late final TextEditingController _weeklyGoalController;
  GoalType _goalType = appState.goalType;
  bool _isSaving = false;

  @override
  void initState() {
    super.initState();
    _targetCaloriesController = TextEditingController(text: appState.targetCalories.toString());
    _proteinController = TextEditingController(text: appState.proteinGoal.toString());
    _carbsController = TextEditingController(text: appState.carbsGoal.toString());
    _fatController = TextEditingController(text: appState.fatGoal.toString());
    _weightGoalController = TextEditingController(text: appState.weightGoal.toStringAsFixed(1));
    _weeklyGoalController = TextEditingController(text: appState.weeklyGoalKg.toStringAsFixed(2));
  }

  @override
  void dispose() {
    _targetCaloriesController.dispose();
    _proteinController.dispose();
    _carbsController.dispose();
    _fatController.dispose();
    _weightGoalController.dispose();
    _weeklyGoalController.dispose();
    super.dispose();
  }

  Future<void> _saveGoals() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(milliseconds: 250));
    appState.updateGoals(
      goalType: _goalType,
      targetCalories: int.parse(_targetCaloriesController.text),
      proteinGoal: int.parse(_proteinController.text),
      carbsGoal: int.parse(_carbsController.text),
      fatGoal: int.parse(_fatController.text),
      weightGoal: double.parse(_weightGoalController.text),
      weeklyGoalKg: double.parse(_weeklyGoalController.text),
      waterGoalGlasses: appState.waterGoalGlasses,
    );
    setState(() => _isSaving = false);
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Goals updated!')));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Goals')),
      body: Padding(
        padding: const EdgeInsets.all(18),
        child: SingleChildScrollView(
          child: Form(
            key: _formKey,
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              const Text('Goals & Targets', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text('Update your daily nutrition and weight targets.', style: TextStyle(color: Colors.black54)),
              const SizedBox(height: 20),
              _buildGoalTypeSelector(),
              const SizedBox(height: 20),
              _buildNumberField(controller: _targetCaloriesController, label: 'Target Calories', hint: '2000', validator: _validateCalories),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _buildNumberField(controller: _proteinController, label: 'Protein (g)', hint: '150', validator: _validateMacros)),
                const SizedBox(width: 12),
                Expanded(child: _buildNumberField(controller: _carbsController, label: 'Carbs (g)', hint: '220', validator: _validateMacros)),
                const SizedBox(width: 12),
                Expanded(child: _buildNumberField(controller: _fatController, label: 'Fat (g)', hint: '65', validator: _validateMacros)),
              ]),
              const SizedBox(height: 16),
              Row(children: [
                Expanded(child: _buildNumberField(controller: _weightGoalController, label: 'Goal Weight (kg)', hint: '70', validator: _validateWeightGoal)),
                const SizedBox(width: 12),
                Expanded(child: _buildNumberField(controller: _weeklyGoalController, label: 'Weekly Rate (kg)', hint: '0.5', validator: _validateWeeklyRate)),
              ]),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: _isSaving ? null : _saveGoals,
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                child: _isSaving ? const SizedBox(height: 20, width: 20, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white)) : const Text('Save Goals', style: TextStyle(fontSize: 16)),
              ),
            ]),
          ),
        ),
      ),
    );
  }

  Widget _buildGoalTypeSelector() {
    return Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
      const Text('Goal Type', style: TextStyle(fontWeight: FontWeight.w600)),
      const SizedBox(height: 12),
      Wrap(spacing: 10, children: GoalType.values.map((goal) {
        final active = goal == _goalType;
        return ChoiceChip(label: Text(goal.label), selected: active, onSelected: (_) => setState(() => _goalType = goal));
      }).toList()),
    ]);
  }

  Widget _buildNumberField({required TextEditingController controller, required String label, required String hint, required String? Function(String?) validator}) {
    return TextFormField(
      controller: controller,
      decoration: InputDecoration(labelText: label, hintText: hint, border: const OutlineInputBorder()),
      keyboardType: TextInputType.number,
      validator: validator,
    );
  }

  String? _validateCalories(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 1000 || number > 5000) return 'Enter calories between 1000-5000';
    return null;
  }

  String? _validateMacros(String? value) {
    final number = int.tryParse(value ?? '');
    if (number == null || number < 0) return 'Enter a valid number';
    return null;
  }

  String? _validateWeightGoal(String? value) {
    final number = double.tryParse(value ?? '');
    if (number == null || number < 30 || number > 300) return 'Enter a realistic goal';
    return null;
  }

  String? _validateWeeklyRate(String? value) {
    final number = double.tryParse(value ?? '');
    if (number == null || number < 0.25 || number > 3) return 'Enter 0.25-3 kg/week';
    return null;
  }
}

class WeightScreen extends StatefulWidget {
  WeightScreen({super.key});

  @override
  State<WeightScreen> createState() => _WeightScreenState();
}

class _WeightScreenState extends State<WeightScreen> {
  final _weightController = TextEditingController();
  bool _showDialog = false;
  bool _isSaving = false;

  @override
  void dispose() {
    _weightController.dispose();
    super.dispose();
  }

  Future<void> _addWeight() async {
    final weight = double.tryParse(_weightController.text);
    if (weight == null || weight < 30 || weight > 300) {
      ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Enter a valid weight between 30 and 300 kg')));
      return;
    }
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(milliseconds: 250));
    appState.logWeight(weight);
    _weightController.clear();
    setState(() { _showDialog = false; _isSaving = false; });
    ScaffoldMessenger.of(context).showSnackBar(const SnackBar(content: Text('Weight logged!')));
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: appState,
      builder: (context, child) {
        if (!appState.isLoggedIn) {
          Future.microtask(() => Navigator.pushReplacementNamed(context, AppRoutes.login));
          return const Scaffold(body: SizedBox.shrink());
        }

        final history = appState.weightHistory;
        final currentWeight = appState.currentWeight;
        final goalWeight = appState.weightGoal;
        final change = history.length > 1 ? currentWeight - history.first.weight : 0.0;

        return Scaffold(
          appBar: AppBar(title: const Text('Weight Tracking')),
          floatingActionButton: FloatingActionButton.extended(
            onPressed: () => setState(() => _showDialog = true),
            label: const Text('Log Weight'),
            icon: const Icon(Icons.add),
          ),
          body: Padding(
            padding: const EdgeInsets.all(18),
            child: SingleChildScrollView(
              child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
                Text('Current Weight: ${currentWeight.toStringAsFixed(1)} kg', style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                Text('Goal: ${goalWeight.toStringAsFixed(1)} kg', style: const TextStyle(color: Colors.black54)),
                const SizedBox(height: 8),
                Text('Change since first log: ${change >= 0 ? '+' : ''}${change.toStringAsFixed(1)} kg', style: TextStyle(color: change < 0 ? Colors.green : Colors.red)),
                const SizedBox(height: 20),
                if (history.isEmpty)
                  const Text('No weight history yet.')
                else
                  Column(children: history.reversed.map((entry) => ListTile(title: Text('${entry.weight.toStringAsFixed(1)} kg'), subtitle: Text('${entry.date.month}/${entry.date.day}/${entry.date.year}'))).toList()),
              ]),
            ),
          ),
        );
      },
    );
  }
}

class ProfileScreen extends StatelessWidget {
  ProfileScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: appState,
      builder: (context, child) {
        if (!appState.isLoggedIn) {
          Future.microtask(() => Navigator.pushReplacementNamed(context, AppRoutes.login));
          return const Scaffold(body: SizedBox.shrink());
        }

        return Scaffold(
          appBar: AppBar(title: const Text('Profile')),
          body: Padding(
            padding: const EdgeInsets.all(18),
            child: Column(crossAxisAlignment: CrossAxisAlignment.stretch, children: [
              const Text('Your Profile', style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _buildInfoRow('Name', appState.fullName),
              _buildInfoRow('Email', appState.email),
              _buildInfoRow('Age', appState.age.toString()),
              _buildInfoRow('Gender', appState.gender.label),
              _buildInfoRow('Height', '${appState.heightCm} cm'),
              _buildInfoRow('Weight', '${appState.weightKg.toStringAsFixed(1)} kg'),
              _buildInfoRow('Activity', appState.activityLevel.label),
              const SizedBox(height: 24),
              ElevatedButton(
                onPressed: () {
                  appState.logout();
                  Navigator.pushNamedAndRemoveUntil(context, AppRoutes.login, (route) => false);
                },
                style: ElevatedButton.styleFrom(padding: const EdgeInsets.symmetric(vertical: 16), shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14))),
                child: const Text('Sign Out', style: TextStyle(fontSize: 16)),
              ),
            ]),
          ),
        );
      },
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        Text(label, style: const TextStyle(fontWeight: FontWeight.w600)),
        Text(value, style: const TextStyle(color: Colors.black54)),
      ]),
    );
  }
}

class NotFoundScreen extends StatelessWidget {
  const NotFoundScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Page Not Found')),
      body: Center(
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          const Text('404', style: TextStyle(fontSize: 60, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          const Text('The page you were looking for does not exist.', style: TextStyle(fontSize: 18, color: Colors.black54), textAlign: TextAlign.center),
          const SizedBox(height: 24),
          ElevatedButton(onPressed: () => Navigator.pushReplacementNamed(context, AppRoutes.home), child: const Text('Back to Home')),
        ]),
      ),
    );
  }
}

class ProgressChip extends StatelessWidget {
  final String label;
  final bool active;

  const ProgressChip({required this.label, required this.active, super.key});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      margin: const EdgeInsets.only(right: 10),
      decoration: BoxDecoration(
        color: active ? Colors.deepPurple : Colors.grey.shade200,
        borderRadius: BorderRadius.circular(14),
      ),
      child: Text(label, style: TextStyle(color: active ? Colors.white : Colors.black87)),
    );
  }
}
