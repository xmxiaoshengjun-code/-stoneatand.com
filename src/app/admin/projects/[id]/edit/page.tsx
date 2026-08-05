import { ProjectForm } from '../../ProjectForm';

export default async function EditProjectPage({ params }: { params: { id: string } }) {
  const projectId = parseInt(params.id, 10);
  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Edit Project</h1>
      <ProjectForm projectId={projectId} />
    </div>
  );
}
