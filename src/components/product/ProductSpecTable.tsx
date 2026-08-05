import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Product } from '@/types/product';

export function ProductSpecTable({ product }: { product: Product }) {
  const specs: Array<{ label: string; value: string | null }> = [
    { label: 'SKU', value: product.sku },
    { label: 'Stand Size (mm)', value: product.standSize },
    { label: 'Panel Size', value: product.panelSize },
    { label: 'Panel Thickness', value: product.panelThickness },
    { label: 'Package Size (mm)', value: product.packageSize },
    { label: 'Number of Panels', value: product.numberOfPanel ? String(product.numberOfPanel) : null },
    { label: 'Adjustable Panel Size', value: product.adjustablePanelSize },
    { label: 'Weight', value: product.weight },
    { label: 'Material', value: product.material },
    { label: 'Series', value: product.series?.name || null },
  ];

  const filteredSpecs = specs.filter((s) => s.value);

  return (
    <div className="overflow-hidden rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-1/3 bg-gray-50">Specification</TableHead>
            <TableHead className="bg-gray-50">Value</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredSpecs.map((spec) => (
            <TableRow key={spec.label}>
              <TableCell className="font-medium text-gray-900">{spec.label}</TableCell>
              <TableCell className="text-gray-700">{spec.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
