import React from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { RouteComponentProps } from "react-router-dom";
import ProjectForm from "./projectForm";
import IProjectActions, * as projectActions from "../../../../redux/actions/projectActions";
import { IApplicationState, IProject, IConnection } from "../../../../models/applicationState";

interface IProjectSettingsPageProps extends RouteComponentProps, React.Props<ProjectSettingsPage> {
    project: IProject;
    recentProjects: IProject[];
    actions: IProjectActions;
    connections: IConnection[];
}

interface IProjectSettingsPageState {
    project: IProject;
}

function mapStateToProps(state: IApplicationState) {
    return {
        project: state.currentProject,
        connections: state.connections,
        recentProjects: state.recentProjects,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        actions: bindActionCreators(projectActions, dispatch),
    };
}

@connect(mapStateToProps, mapDispatchToProps)
export default class ProjectSettingsPage extends React.Component<IProjectSettingsPageProps, IProjectSettingsPageState> {
    constructor(props, context) {
        super(props, context);

        this.state = {
            project: this.props.project,
        };

        const projectId = this.props.match.params["projectId"];
        if (!this.props.project && projectId) {
            const project = this.props.recentProjects.find((project) => project.id === projectId);
            this.props.actions.loadProject(project);
        }

        this.onFormSubmit = this.onFormSubmit.bind(this);
    }

    public render() {
        return (
            <div className="m-3 text-light">
                <h3><i className="fas fa-sliders-h fa-1x"></i><span className="px-2">Project Settings</span></h3>
                <div className="m-3 text-light">
                    <ProjectForm
                        project={this.state.project}
                        connections={this.props.connections}
                        onSubmit={this.onFormSubmit} />
                </div>
            </div>
        );
    }

    private onFormSubmit = (form) => {
        if (form.formData.tags) {
            form.formData.tags = JSON.parse(form.formData.tags);
        }

        this.setState({
            project: {
                ...form.formData,
                sourceConnection: this.props.connections
                    .find((connection) => connection.id === form.formData.sourceConnectionId),
                targetConnection: this.props.connections
                    .find((connection) => connection.id === form.formData.targetConnectionId),
            },
        }, async () => {
            await this.props.actions.saveProject(this.state.project);
            this.props.history.push(`/projects/${this.state.project.id}/edit`);
        });
    }
}