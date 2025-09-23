# Contributing to Tripflow

Thank you for considering contributing to Tripflow! We welcome contributions from everyone.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- Python (3.8 or higher)
- Git

### Setting up the Development Environment

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/yourusername/tripflow.git
   cd tripflow
   ```

3. Install dependencies:
   ```bash
   # Backend
   cd backend
   pip install -r requirements.txt
   
   # Frontend
   cd frontend
   npm install --legacy-peer-deps
   ```

4. Set up environment variables (see README.md)

5. Run the application:
   ```bash
   .\start-tripflow.ps1
   ```

## 🛠️ Development Guidelines

### Code Style
- **Frontend**: Follow React best practices and use ESLint
- **Backend**: Follow PEP 8 Python style guide
- **General**: Write descriptive commit messages

### Branch Naming
- Feature: `feature/description`
- Bug fix: `fix/description`  
- Documentation: `docs/description`

### Commit Messages
Follow conventional commits format:
- `feat:` new feature
- `fix:` bug fix
- `docs:` documentation changes
- `style:` formatting changes
- `refactor:` code refactoring
- `test:` adding tests

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Update documentation if needed
5. Submit a pull request with clear description

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm test
```

### Backend Testing
```bash
cd backend
pytest
```

## 📝 Documentation

When adding new features:
- Update README.md if needed
- Add API documentation for new endpoints
- Include code comments for complex logic

## 🐛 Bug Reports

When reporting bugs, please include:
- Steps to reproduce
- Expected vs actual behavior
- Screenshots (if applicable)
- Environment details (OS, browser, versions)

## 💡 Feature Requests

For new features:
- Check existing issues first
- Provide clear use case and requirements
- Consider implementation complexity
- Discuss with maintainers before major changes

## 📞 Getting Help

- Check the documentation
- Search existing issues
- Create a new issue with detailed description
- Join our community discussions

Thank you for contributing! 🎉
