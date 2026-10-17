// /frontend/__mocks__/componentMocks.js

// Mock base que será usado para todos los componentes e iconos
const ComponentMock = ({ children, ...props }) => {
  // Devolvemos el nombre del componente para que React Testing Library no falle
  return <div data-testid="MockedComponent" {...props}>{children}</div>;
};

// 1. Exportación por defecto: Usada para componentes importados con 'import Layout from ...'
export default ComponentMock;

// 2. Exportaciones con nombre: Usadas para componentes importados con 'import { Icon } from ...'
// Esto asegura que Jest encuentre las referencias SparklesIcon y CheckCircleIcon
export const SparklesIcon = ComponentMock;
export const CheckCircleIcon = ComponentMock;
