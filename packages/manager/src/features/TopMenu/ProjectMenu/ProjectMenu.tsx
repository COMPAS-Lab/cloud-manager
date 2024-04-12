import React, { useEffect, useState } from 'react';
// import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
// import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { useSnackbar } from 'notistack';
import Select from 'src/components/EnhancedSelect/Select';

import {
  fetchCurrentProject,
  fetchProjects,
  fetchProjectToken,
} from '@linode/api-v4/lib/account/projects';
import { Project } from '@linode/api-v4/lib/account/types';

export interface ExtendedProject extends Project {
  label: string;
  value: string;
}

const useStyles = makeStyles((theme: Theme) => ({
  container: {
    marginLeft: theme.spacing(1),
    minWidth: '150px',
  },
  select: {
    backgroundColor: theme.palette.primary.main,
    fontWeight: 'bold',
    color: 'white',
    border: 'none',
    fontSize: theme.typography.fontSize,
    '&:focus': {
      backgroundColor: theme.palette.primary.light,
    },
  },
}));

const ProjectMenu: React.FC = () => {
  const classes = useStyles();
  const [projects, setProjects] = useState<ExtendedProject[]>([]);
  const { enqueueSnackbar } = useSnackbar();
  const [selectedProject, setSelectedProject] = useState<ExtendedProject>();
  useEffect(() => {
    Promise.all([fetchCurrentProject(), fetchProjects()])
      .then(([project, projects]) => {
        setSelectedProject({
          ...project,
          value: project.id,
          label: project.name,
        });
        setProjects(
          projects.map((proj) => ({
            ...proj,
            value: proj.id,
            label: proj.name,
          }))
        );
      })
      .catch((error) => {
        enqueueSnackbar('Error fetching projects');
      });
  }, []);

  const handleSelectProject = async (project: ExtendedProject) => {
    // If the selected project is the current project, ignore
    if (project.value === selectedProject?.id) return;
    setSelectedProject(projects.find((proj) => proj.id === project.value));
    try {
      const token = await fetchProjectToken(project.value);
      if (token) {
        window.localStorage.setItem('authentication/token', token);
        window.location.reload();
      } else throw new Error('Failed to fetch project token');
    } catch (error) {
      enqueueSnackbar('Error switching to project: ' + project.label);
    }
    enqueueSnackbar('Switched to project: ' + project.label);
  };

  return (
    <>
      {projects.length > 1 && (
        <div className={classes.container}>
          <Select
            className={classes.select}
            value={selectedProject}
            onChange={handleSelectProject}
            isClearable={false}
            placeholder="Select a Project"
            options={projects.map((project) => ({
              value: project.id,
              label: project.name,
            }))}
            hideLabel={true}
          />
        </div>
      )}
    </>
  );
};

export default ProjectMenu;
