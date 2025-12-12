# Draggable Grid

Une librairie React Native moderne pour créer des grilles drag & drop avec réorganisation, mode édition, et fonctionnalités avancées.

## ✨ Fonctionnalités

- ✅ **Drag & Drop** - Réorganisez les items par glissement
- ✅ **Mode Édition** - Activé par long press
- ✅ **Animation Jiggle** - Animation de tremblement en mode édition
- ✅ **Items Lockés** - Certains items peuvent être verrouillés
- ✅ **Hauteurs Dynamiques** - Support des hauteurs variables (single column)
- ✅ **Drag Outside** - Détecte quand un item est traîné en dehors
- ✅ **Groupement** - Fusionnez des items ensemble (optionnel)
- ✅ **Boutons de Suppression** - Ajoutez des boutons custom en mode édition
- ✅ **ScrollView Support** - Fonctionne avec ScrollView
- ✅ **TypeScript** - Types complets
- ✅ **Performant** - Optimisé avec hooks et memoization

## 📦 Installation

Cette librairie est déjà incluse dans votre projet. Elle se trouve dans `/components/ui/draggable-grid`.

## 🚀 Utilisation Basique

```tsx
import { DraggableGrid, DraggableGridItem } from '@/components/ui/draggable-grid';

interface MyItem extends DraggableGridItem {
    label: string;
    color: string;
}

function MyComponent() {
    const [items, setItems] = useState<MyItem[]>([
        { key: '1', label: 'Item 1', color: '#FF6B6B' },
        { key: '2', label: 'Item 2', color: '#4ECDC4' },
        { key: '3', label: 'Item 3', color: '#45B7D1' },
    ]);

    return (
        <DraggableGrid
            data={items}
            numColumns={3}
            renderItem={(item, order) => (
                <View style={{ flex: 1, backgroundColor: item.color }}>
                    <Text>{item.label}</Text>
                </View>
            )}
            onDragRelease={(newItems) => setItems(newItems)}
        />
    );
}
```

## 📖 API

### Props

#### Required

| Prop | Type | Description |
|------|------|-------------|
| `data` | `T[]` | Array d'items à afficher |
| `numColumns` | `number` | Nombre de colonnes dans la grille |
| `renderItem` | `(item: T, order: number) => ReactElement` | Fonction pour rendre chaque item |

#### Layout

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `style` | `ViewStyle` | - | Style du container principal |
| `itemHeight` | `number` | `width/numColumns` | Hauteur fixe des items |
| `getItemHeight` | `(item: T) => number` | - | Fonction pour hauteurs dynamiques (single column uniquement) |

#### Drag Behavior

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `dragStartAnimation` | `StyleProp<ViewStyle>` | - | Style appliqué lors du début du drag |
| `delayLongPress` | `number` | `200` | Délai en ms pour activer le mode édition |

#### Callbacks

| Prop | Type | Description |
|------|------|-------------|
| `onItemPress` | `(item: T) => void` | Appelé lors du tap sur un item (hors mode édition) |
| `onDragStart` | `(item: T) => void` | Appelé au début du drag |
| `onDragging` | `(gestureState) => void` | Appelé pendant le drag |
| `onDragRelease` | `(newSortedData: T[]) => void` | Appelé à la fin du drag avec le nouveau tableau |
| `onDragOutside` | `(item: T) => void` | Appelé quand un item est traîné en dehors de la grille |
| `onEditModeChange` | `(isEditMode: boolean) => void` | Appelé quand le mode édition change |

#### Edit Mode Features

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableJiggle` | `boolean` | `true` | Active l'animation de tremblement |
| `onItemDelete` | `(item: T) => void` | - | Callback de suppression |
| `renderDeleteButton` | `(item: T, onDelete: () => void) => ReactElement` | - | Rend un bouton de suppression custom |

#### Grouping (Optionnel)

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `enableGrouping` | `boolean` | `false` | Active la fonctionnalité de groupement |
| `onGroupCreate` | `(items: T[], targetItem: T) => void` | - | Appelé lors de la création d'un groupe |

### Item Type

Votre type d'item doit étendre `DraggableGridItem`:

```typescript
interface DraggableGridItem {
    key: string | number;        // Clé unique (requis)
    disabledDrag?: boolean;      // Empêche le drag de cet item
    disabledReSorted?: boolean;  // Empêche les autres items de pousser celui-ci
}
```

### Ref Methods

```typescript
interface DraggableGridRef {
    exitEditMode: () => void;                    // Quitte le mode édition programmatiquement
    applyScrollOffset: (deltaY: number) => void; // Pour ScrollView support
}

// Utilisation
const gridRef = useRef<DraggableGridRef>(null);
gridRef.current?.exitEditMode();
```

## 📚 Exemples

### Avec Bouton de Suppression

```tsx
<DraggableGrid
    data={items}
    numColumns={3}
    renderItem={(item) => <ItemComponent item={item} />}
    onDragRelease={setItems}
    renderDeleteButton={(item, onDelete) => (
        <TouchableOpacity onPress={onDelete}>
            <Text>❌</Text>
        </TouchableOpacity>
    )}
    onItemDelete={(item) => {
        setItems(prev => prev.filter(i => i.key !== item.key));
    }}
/>
```

### Avec Groupement

```tsx
<DraggableGrid
    data={items}
    numColumns={3}
    renderItem={(item) => <ItemComponent item={item} />}
    onDragRelease={setItems}
    enableGrouping={true}
    onGroupCreate={(groupItems, targetItem) => {
        console.log('Créer un groupe avec:', groupItems);
        // Implémenter votre logique de groupement
    }}
/>
```

### Avec Drag Outside

```tsx
<DraggableGrid
    data={items}
    numColumns={3}
    renderItem={(item) => <ItemComponent item={item} />}
    onDragRelease={setItems}
    onDragOutside={(item) => {
        // Supprimer l'item
        setItems(prev => prev.filter(i => i.key !== item.key));
    }}
/>
```

### Dans un ScrollView

```tsx
const gridRef = useRef<DraggableGridRef>(null);
const scrollY = useRef(0);

<ScrollView
    onScroll={(e) => {
        const newScrollY = e.nativeEvent.contentOffset.y;
        const deltaY = newScrollY - scrollY.current;
        scrollY.current = newScrollY;
        gridRef.current?.applyScrollOffset(deltaY);
    }}
    scrollEventThrottle={16}
>
    <DraggableGrid
        ref={gridRef}
        data={items}
        numColumns={3}
        renderItem={(item) => <ItemComponent item={item} />}
        onDragRelease={setItems}
    />
</ScrollView>
```

### Items Lockés

```tsx
const items = [
    { key: '1', label: 'Item 1' },
    { key: '2', label: 'Item 2', disabledDrag: true }, // Ne peut pas être déplacé
    { key: '3', label: 'Item 3', disabledReSorted: true }, // Ne peut pas bouger
];
```

## 🏗️ Architecture

La librairie est structurée en plusieurs modules :

```
draggable-grid/
├── components/
│   ├── DraggableGrid.tsx    # Composant principal
│   └── GridItem.tsx          # Composant item avec animations
├── hooks/
│   ├── useEditMode.ts        # Gestion du mode édition
│   ├── useGridLayout.ts      # Calculs de layout
│   ├── useDragAnimation.ts   # Animations du drag
│   ├── useReorder.ts         # Logique de réorganisation
│   └── useGrouping.ts        # Logique de groupement
├── types/
│   └── index.tsx             # Types TypeScript
├── utils/
│   └── constants.ts          # Constantes
└── index.ts                  # Export principal
```

## 🎨 Personnalisation

### Changer les Constantes d'Animation

Modifiez `/utils/constants.ts`:

```typescript
export const JIGGLE_DURATION = 100;        // Durée de l'animation jiggle
export const JIGGLE_ANGLE = 1.5;           // Angle de rotation
export const DRAG_SCALE = 1.1;             // Scale lors du drag
export const GROUPING_SCALE = 1.15;        // Scale lors du groupement
export const DEFAULT_LONG_PRESS_DURATION = 200; // Délai long press
export const GROUPING_HOVER_DURATION = 300;     // Délai pour grouper
```

## 🐛 Debugging

Pour activer les logs:

```tsx
<DraggableGrid
    // ... autres props
    onDragStart={(item) => console.log('Drag start:', item)}
    onDragging={(gestureState) => console.log('Dragging:', gestureState)}
    onDragRelease={(items) => console.log('Drag release:', items)}
    onEditModeChange={(isEditMode) => console.log('Edit mode:', isEditMode)}
/>
```

## 📝 Notes

- Les hauteurs dynamiques ne sont supportées qu'avec `numColumns={1}`
- Le groupement nécessite `enableGrouping={true}`
- En mode édition, un tap sur un item ou en dehors de la grille désactive le mode
- Les items avec `disabledDrag={true}` ne peuvent pas être déplacés mais peuvent être poussés
- Les items avec `disabledReSorted={true}` restent toujours à leur position

## 🤝 Contribution

Cette librairie est une réécriture moderne de `react-native-draggable-grid` avec:
- Hooks modernes
- TypeScript complet
- Architecture modulaire
- Meilleure performance
- Code plus maintenable

## 📄 License

MIT
