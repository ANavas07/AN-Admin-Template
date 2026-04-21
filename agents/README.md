# Arquitectura Admin Panel - CRM Tournaments

## 📊 Flujo de la Aplicación

```
App.tsx
├── Navbar (común a toda la app)
│   ├── Select de Roles
│   ├── Dropdown de Usuario
│   └── Toggle Tema Claro/Oscuro
│
└── Renderización condicional según rol:
    │
    ├─ ROL: admin/organizer
    │  └─ AdminPanel.tsx
    │     └─ MainPanel.tsx
    │        ├─ SidebarPanel (30% ancho)
    │        │  └─ Información del usuario + Botones
    │        │
    │        └─ Área Principal (70% ancho)
    │           ├─ Encabezado + Breadcrumb
    │           ├─ Buscador de módulos
    │           └─ Categorías expandibles
    │              └─ Grid de ModuleCard
    │
    └─ ROL: analyst/viewer
       └─ Dashboard inicial (sin AdminPanel)
```

## 🗂️ Estructura de Archivos

```
src/
├── App.tsx (componente raíz con router lógico por roles)
├── components/
│  └── common/
│     └── navbar/
│        └── navbar.tsx (navbar con roles y tema)
│
└── features/
   └── admin-panel/
      ├── AdminPanel.tsx (contenedor del admin)
      ├── components/
      │  ├── MainPanel.tsx (layout principal)
      │  ├── SidebarPanel.tsx (sidebar con info usuario)
      │  └── ModuleCard.tsx (tarjeta individual)
      │
      └── data/
         └── modules.ts (base de datos de módulos)
```

## 🔄 Flujo de Datos

### 1. **User Role Selection (Navbar)**
```typescript
App.tsx
  currentRole: 'admin' | 'organizer' | 'analyst' | 'viewer'
  ↓
  onChangeRole(newRole) → setCurrentRole(newRole)
  ↓
  Renderiza AdminPanel O Dashboard según rol
```

### 2. **Module Filtering (MainPanel)**
```typescript
searchQuery + userRole
  ↓
useMemo → filteredCategories
  ↓
Solo muestra módulos:
- Que coincidan con la búsqueda
- Para los que el usuario tiene permisos (requiredRoles)
```

### 3. **Module Card Interaction (ModuleCard)**
```typescript
onClick → onModuleClick(moduleId)
  ↓
Aquí puedes:
- Navegar a una página detallada
- Abrir un modal
- Hacer una API call
```

## 🎨 Sistema de Temas (Variables CSS)

### Tema Claro
- `--color-bg`: #f4f8f3
- `--color-surface`: #ffffff
- `--color-text`: #182222
- `--color-brand`: #0ea55b (verde deportivo)
- `--color-highlight`: #0ea5e9 (azul)

### Tema Oscuro
- `--color-bg`: #0c1518
- `--color-surface`: #111e23
- `--color-text`: #e5f1ef
- `--color-brand`: #22c26f (verde más brillante)
- `--color-highlight`: #38bdf8 (azul más brillante)

## 📋 Módulos y Categorías

Los módulos están organizados por categorías en `modules.ts`:

```typescript
MODULE_CATEGORIES: ModuleCategory[] = [
  {
    name: 'ADMINISTRATIVOS',
    icon: '📋',
    modules: [
      {
        id: 'attendance',
        title: 'Atención bienestar universitario',
        description: '...',
        icon: '📅',
        requiredRoles: ['admin', 'organizer']  // ← Control de acceso
      },
      // más módulos...
    ]
  },
  // más categorías...
]
```

## 🔐 Control de Acceso por Rol

```typescript
// En MainPanel.tsx
const filteredCategories = useMemo(() => {
  return categories
    .map((category) => ({
      ...category,
      modules: category.modules.filter((module) => {
        // 1. Filtrar por búsqueda
        const matchesSearch = ...
        
        // 2. Filtrar por permisos de rol
        const hasAccess = 
          !module.requiredRoles || 
          module.requiredRoles.includes(userRole)
        
        return matchesSearch && hasAccess
      }),
    }))
    .filter((category) => category.modules.length > 0)
}, [categories, searchQuery, userRole])
```

## 🎯 Próximos Pasos Recomendados

1. **Conectar a API real**
   - Cambiar `currentUser` en App.tsx por datos de backend
   - Reemplazar `MODULE_CATEGORIES` estático con datos dinámicos

2. **Implementar navegación**
   ```typescript
   // En ModuleCard onClick
   onModuleClick={(moduleId) => {
     navigate(`/admin/module/${moduleId}`)
   }}
   ```

3. **Agregar más acciones**
   - En SidebarPanel: implementar `onUploadPhoto`, `onIdentification`
   - En dropdown de usuario: navegar a perfil, configuración, etc.

4. **Persistencia de datos**
   - Guardar rol seleccionado en localStorage
   - Guardar preferencias de usuario

## 💡 Cómo Agregar Nuevos Módulos

En `modules.ts`:

```typescript
{
  name: 'DEPORTES',
  icon: '⚽',
  modules: [
    {
      id: 'tournaments-admin',
      title: 'Gestión de Torneos',
      description: 'Crear y administrar torneos',
      icon: '🏆',
      requiredRoles: ['admin', 'organizer']
    },
    // agregar más...
  ]
}
```

## 📱 Responsividad

- **Desktop (lg)**: Sidebar 280px + MainPanel 1fr
- **Tablet (md)**: Sidebar 280px + MainPanel (más comprimido)
- **Mobile**: Sidebar debajo, MainPanel full-width

---

**Estado**: ✅ Listo para usar con Tailwind v4
**Tema**: 🌓 Soporte claro/oscuro automático
**Acceso**: 🔐 Control por roles integrado
