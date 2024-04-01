import React, { useEffect, useState } from 'react';
import { Menu, MenuButton, MenuList, MenuItem } from '@reach/menu-button';
import '@reach/menu-button/styles.css';
import KeyboardArrowDown from '@material-ui/icons/KeyboardArrowDown';
import { makeStyles, Theme } from '@material-ui/core/styles';
import { Snackbar } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';

// Assuming the path to fetchProjects is correct. Adjust if necessary.
import { fetchProjects } from '@linode/api-v4/lib/account/projects';
import { Project } from '@linode/api-v4/lib/account/types';

const useStyles = makeStyles((theme: Theme) => ({
  button: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: theme.palette.primary.main,
    color: '#fff',
    '&:hover, &:focus': {
      backgroundColor: theme.palette.primary.dark,
    },
    '&[aria-expanded="true"]': {
      backgroundColor: theme.palette.primary.light,
    },
  },
  caret: {
    marginLeft: theme.spacing(1),
  },
}));

const ProjectMenu: React.FC = () => {
    const classes = useStyles();
    const [projects, setProjects] = useState<Project[]>([]);
    const [openSnackbar, setOpenSnackbar] = useState(false);
    const [selectedProject, setSelectedProject] = useState('');

    useEffect(() => {
      fetchProjects().then(response => {
        setProjects(response);
        console.log("Projects fetched", response);
      }).catch(error => {
        console.error("Error fetching projects:", error);
      });
    }, []);

    const handleSelectProject = (projectName: string) => {
      setSelectedProject(projectName);
      setOpenSnackbar(true);
    };
  
    const handleCloseSnackbar = () => {
      setOpenSnackbar(false);
    };

    return (
      <>
        <Menu>
            <MenuButton className={classes.button}>
                {selectedProject || 'Projects'} <KeyboardArrowDown className={classes.caret} />
            </MenuButton>
            <MenuList>
                {projects.map((project) => (
                    <MenuItem key={project.id.toString()} onSelect={() => handleSelectProject(project.name)}>
                        {project.name}
                    </MenuItem>
                ))}
            </MenuList>
        </Menu>

        <Snackbar
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
        >
          <Alert onClose={handleCloseSnackbar} severity="success">
            Switched to project: {selectedProject}
          </Alert>
        </Snackbar>
      </>
    );
  };
  
export default ProjectMenu;
